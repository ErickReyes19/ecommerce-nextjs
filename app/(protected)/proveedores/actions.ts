"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProveedorInput, proveedorSchema } from "./schema";

export async function getProveedores() {
  return prisma.provider.findMany({
    include: { services: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProveedorById(id: string) {
  return prisma.provider.findUnique({
    where: { id },
    include: { services: true },
  });
}

export async function getProveedoresSelector() {
  return prisma.provider.findMany({
    where: { active: true },
    select: { id: true, name: true, services: { where: { active: true }, select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

function pickArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const value = payload as Record<string, unknown>;
  if (Array.isArray(value.products)) return value.products;
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function syncProveedorProductos(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: { services: { where: { active: true } } },
  });

  if (!provider) return { ok: false, error: "Proveedor no encontrado" };

  const fallbackCategory = await prisma.category.upsert({
    where: { slug: "proveedor-sin-categoria" },
    update: { name: "Proveedor sin categoría" },
    create: { name: "Proveedor sin categoría", slug: "proveedor-sin-categoria" },
  });

  let synced = 0;
  const errors: string[] = [];

  for (const service of provider.services) {
    try {
      const response = await fetch(`${service.baseUrl}${service.productEndpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(service.authType.toUpperCase() === "BEARER" && service.token ? { Authorization: `Bearer ${service.token}` } : {}),
          ...(service.authType.toUpperCase() === "API_KEY" && service.apiKey ? { "x-api-key": service.apiKey } : {}),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        errors.push(`${service.name}: HTTP ${response.status}`);
        continue;
      }

      const raw = await response.json();
      const items = pickArray(raw);

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        if (!item || typeof item !== "object") continue;

        const data = item as Record<string, unknown>;
        const externalProductId = String(data.id ?? data.externalId ?? data.productId ?? "").trim();
        if (!externalProductId) continue;

        const name = String(data.name ?? data.title ?? `Producto ${externalProductId}`).trim();
        const sku = String(data.sku ?? `PRV-${service.id.slice(0, 6)}-${externalProductId}`).trim();
        const basePrice = toNumber(data.price ?? data.basePrice ?? data.unitPrice, 0);
        const stock = Math.max(0, Math.floor(toNumber(data.stock ?? data.quantity ?? data.inventory, 0)));
        const description = String(data.description ?? data.shortDescription ?? name).trim();
        const imageUrl = String(data.image ?? data.imageUrl ?? data.thumbnail ?? "").trim();

        const slugBase = toSlug(String(data.slug ?? name)) || `producto-${externalProductId}`;
        const slug = `${slugBase}-${service.id.slice(0, 4)}-${index}`;

        const existing = await prisma.product.findFirst({
          where: { providerServiceId: service.id, externalProductId },
          include: { variants: { where: { isDefault: true }, take: 1 } },
        });

        const product = existing
          ? await prisma.product.update({
              where: { id: existing.id },
              data: {
                name,
                description,
                shortDescription: description,
                basePrice,
                active: true,
                syncMetadata: JSON.stringify(data),
              },
            })
          : await prisma.product.create({
              data: {
                name,
                slug,
                description,
                shortDescription: description,
                sku,
                active: true,
                basePrice,
                categoryId: fallbackCategory.id,
                providerId: provider.id,
                providerServiceId: service.id,
                externalProductId,
                syncMetadata: JSON.stringify(data),
                images: imageUrl
                  ? {
                      create: [{ url: imageUrl, isMain: true, sortOrder: 0 }],
                    }
                  : undefined,
              },
            });

        const defaultVariant = existing?.variants[0] ?? null;
        if (defaultVariant) {
          await prisma.productVariant.update({
            where: { id: defaultVariant.id },
            data: {
              sku: `${sku}-DEFAULT`,
              name: "Default",
              price: basePrice,
              stock,
              isDefault: true,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku: `${sku}-DEFAULT`,
              name: "Default",
              price: basePrice,
              stock,
              isDefault: true,
            },
          });
        }

        synced += 1;
      }
    } catch (error) {
      errors.push(`${service.name}: ${error instanceof Error ? error.message : "Error no controlado"}`);
    }
  }

  revalidatePath("/proveedores");
  revalidatePath("/productos-admin");

  return { ok: true, synced, errors };
}

export async function createProveedor(data: ProveedorInput) {
  const parsed = proveedorSchema.parse(data);

  await prisma.provider.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      type: parsed.type,
      active: parsed.active,
      services: {
        create: parsed.services.map((service) => ({
          name: service.name,
          baseUrl: service.baseUrl,
          productEndpoint: service.productEndpoint,
          orderEndpoint: service.orderEndpoint,
          authType: service.authType,
          token: service.token || null,
          apiKey: service.apiKey || null,
          secretKey: service.secretKey || null,
          headersJson: service.headersJson || null,
          active: service.active,
        })),
      },
    },
  });

  revalidatePath("/proveedores");
}

export async function updateProveedor(data: ProveedorInput) {
  const parsed = proveedorSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");

  await prisma.provider.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      type: parsed.type,
      active: parsed.active,
      services: {
        deleteMany: {},
        create: parsed.services.map((service) => ({
          name: service.name,
          baseUrl: service.baseUrl,
          productEndpoint: service.productEndpoint,
          orderEndpoint: service.orderEndpoint,
          authType: service.authType,
          token: service.token || null,
          apiKey: service.apiKey || null,
          secretKey: service.secretKey || null,
          headersJson: service.headersJson || null,
          active: service.active,
        })),
      },
    },
  });

  revalidatePath("/proveedores");
}

export async function deleteProveedor(id: string) {
  await prisma.provider.delete({ where: { id } });
  revalidatePath("/proveedores");
}
