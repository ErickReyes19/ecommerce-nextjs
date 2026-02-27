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

function parseJsonObject(value: string | null | undefined): Record<string, unknown> {
  if (!value?.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function readPath(data: Record<string, unknown>, pathOrName: string): unknown {
  if (!pathOrName) return undefined;
  if (pathOrName in data) return data[pathOrName];

  return pathOrName.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, data);
}

function pickValue(data: Record<string, unknown>, field: string, fallbacks: string[], mapping: Record<string, unknown>) {
  const mapped = typeof mapping[field] === "string" ? readPath(data, mapping[field] as string) : undefined;
  if (mapped !== undefined && mapped !== null && `${mapped}`.trim() !== "") return mapped;
  for (const key of fallbacks) {
    const value = readPath(data, key);
    if (value !== undefined && value !== null && `${value}`.trim() !== "") return value;
  }
  return undefined;
}

function mapProviderProduct(data: Record<string, unknown>, serviceId: string, mapping: Record<string, unknown>) {
  const externalProductId = String(pickValue(data, "externalProductId", ["id", "externalId", "productId"], mapping) ?? "").trim();
  if (!externalProductId) return null;

  const name = String(pickValue(data, "name", ["name", "title"], mapping) ?? `Producto ${externalProductId}`).trim();
  const sku = String(pickValue(data, "sku", ["sku"], mapping) ?? `PRV-${serviceId.slice(0, 6)}-${externalProductId}`).trim();
  const basePrice = toNumber(pickValue(data, "price", ["price", "basePrice", "unitPrice"], mapping), 0);
  const stock = Math.max(0, Math.floor(toNumber(pickValue(data, "stock", ["stock", "quantity", "inventory"], mapping), 0)));
  const description = String(pickValue(data, "description", ["description", "shortDescription"], mapping) ?? name).trim();
  const imageUrl = String(pickValue(data, "image", ["image", "imageUrl", "thumbnail"], mapping) ?? "").trim();
  const rawSlug = String(pickValue(data, "slug", ["slug"], mapping) ?? name).trim();
  const rating = Math.max(0, Math.min(5, toNumber(pickValue(data, "rating", ["rating"], mapping), 0)));

  return {
    externalProductId,
    name,
    sku,
    basePrice,
    stock,
    description,
    imageUrl,
    rating,
    slugBase: toSlug(rawSlug) || `producto-${externalProductId}`,
  };
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
      const mapping = parseJsonObject(service.productMappingJson);
      const extraHeaders = parseJsonObject(service.headersJson);
      const response = await fetch(`${service.baseUrl}${service.productEndpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(service.authType.toUpperCase() === "BEARER" && service.token ? { Authorization: `Bearer ${service.token}` } : {}),
          ...(service.authType.toUpperCase() === "API_KEY" && service.apiKey ? { "x-api-key": service.apiKey } : {}),
          ...Object.fromEntries(Object.entries(extraHeaders).filter(([, v]) => typeof v === "string") as Array<[string, string]>),
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

        const mapped = mapProviderProduct(item as Record<string, unknown>, service.id, mapping);
        if (!mapped) continue;

        const slug = `${mapped.slugBase}-${service.id.slice(0, 4)}-${index}`;

        const existing = await prisma.product.findFirst({
          where: { providerServiceId: service.id, externalProductId: mapped.externalProductId },
          include: { variants: { where: { isDefault: true }, take: 1 } },
        });

        const product = existing
          ? await prisma.product.update({
              where: { id: existing.id },
              data: {
                name: mapped.name,
                description: mapped.description,
                shortDescription: mapped.description,
                basePrice: mapped.basePrice,
                rating: mapped.rating,
                active: true,
                syncMetadata: JSON.stringify(item),
              },
            })
          : await prisma.product.create({
              data: {
                name: mapped.name,
                slug,
                description: mapped.description,
                shortDescription: mapped.description,
                sku: mapped.sku,
                active: true,
                basePrice: mapped.basePrice,
                rating: mapped.rating,
                categoryId: fallbackCategory.id,
                providerId: provider.id,
                providerServiceId: service.id,
                externalProductId: mapped.externalProductId,
                syncMetadata: JSON.stringify(item),
                images: mapped.imageUrl
                  ? {
                      create: [{ url: mapped.imageUrl, isMain: true, sortOrder: 0 }],
                    }
                  : undefined,
              },
            });

        const defaultVariant = existing?.variants[0] ?? null;
        if (defaultVariant) {
          await prisma.productVariant.update({
            where: { id: defaultVariant.id },
            data: {
              sku: `${mapped.sku}-DEFAULT`,
              name: "Default",
              price: mapped.basePrice,
              stock: mapped.stock,
              isDefault: true,
            },
          });
        } else {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku: `${mapped.sku}-DEFAULT`,
              name: "Default",
              price: mapped.basePrice,
              stock: mapped.stock,
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
          productMappingJson: service.productMappingJson || null,
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
          productMappingJson: service.productMappingJson || null,
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
