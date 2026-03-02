"use server";

import { prisma } from "@/lib/prisma";
import { productSchema, ProductInput } from "./schema";
import { revalidatePath } from "next/cache";
import { isValidImageUrl } from "@/src/lib/image-url";

function parseImageUrls(imageUrls?: string | null) {
  return (imageUrls ?? "")
    .split(/[\r\n,]+/)
    .map((url) => url.trim())
    .filter((url) => isValidImageUrl(url))
    .map((url, index) => ({
      url,
      isMain: index === 0,
      sortOrder: index,
    }));
}


export async function getProductos() {
  return prisma.product.findMany({
    include: { category: true, brand: true, provider: true, providerService: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getProductoById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { isDefault: "desc" } },
      images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
    },
  });
}

export async function getProductoFormOptions() {
  const [categorias, marcas, proveedores] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.provider.findMany({
      where: { active: true },
      select: { id: true, name: true, services: { where: { active: true }, select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return { categorias, marcas, proveedores };
}

export async function createProduct(data: ProductInput) {
  const parsed = productSchema.parse(data);
  await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      shortDescription: parsed.shortDescription || null,
      sku: parsed.sku,
      active: parsed.active,
      basePrice: parsed.basePrice,
      compareAtPrice: parsed.compareAtPrice || null,
      categoryId: parsed.categoryId,
      brandId: parsed.brandId || null,
      providerId: parsed.providerId || null,
      providerServiceId: parsed.providerServiceId || null,
      externalProductId: parsed.externalProductId || null,
      syncMetadata: parsed.syncMetadata || null,
      images: {
        create: parseImageUrls(parsed.imageUrls),
      },
      variants: {
        create: {
          sku: `${parsed.sku}-DEFAULT`,
          name: parsed.defaultVariantName,
          price: parsed.basePrice,
          salePrice: parsed.salePrice || null,
          stock: parsed.stock,
          weight: parsed.defaultVariantWeight || null,
          isDefault: true,
        },
      },
    },
  });
  revalidatePath("/productos-admin");
  return { ok: true };
}

export async function updateProduct(data: ProductInput) {
  const parsed = productSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");

  const defaultVariant = await prisma.productVariant.findFirst({
    where: { productId: parsed.id, isDefault: true },
    orderBy: { createdAt: "asc" },
  });

  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      shortDescription: parsed.shortDescription || null,
      sku: parsed.sku,
      active: parsed.active,
      basePrice: parsed.basePrice,
      compareAtPrice: parsed.compareAtPrice || null,
      categoryId: parsed.categoryId,
      brandId: parsed.brandId || null,
      providerId: parsed.providerId || null,
      providerServiceId: parsed.providerServiceId || null,
      externalProductId: parsed.externalProductId || null,
      syncMetadata: parsed.syncMetadata || null,
      images: {
        deleteMany: {},
        create: parseImageUrls(parsed.imageUrls),
      },
      variants: defaultVariant
        ? {
            update: {
              where: { id: defaultVariant.id },
              data: {
                sku: `${parsed.sku}-DEFAULT`,
                name: parsed.defaultVariantName,
                price: parsed.basePrice,
                salePrice: parsed.salePrice || null,
                stock: parsed.stock,
                weight: parsed.defaultVariantWeight || null,
                isDefault: true,
              },
            },
          }
        : {
            create: {
              sku: `${parsed.sku}-DEFAULT`,
              name: parsed.defaultVariantName,
              price: parsed.basePrice,
              salePrice: parsed.salePrice || null,
              stock: parsed.stock,
              weight: parsed.defaultVariantWeight || null,
              isDefault: true,
            },
          },
    },
  });
  revalidatePath("/productos-admin");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/productos-admin");
}
