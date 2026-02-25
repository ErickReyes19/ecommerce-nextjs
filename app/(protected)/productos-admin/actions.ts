"use server";

import { prisma } from "@/lib/prisma";
import { productSchema, ProductInput } from "./schema";
import { revalidatePath } from "next/cache";

export async function getProductos() {
  return prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function getProductoById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: ProductInput) {
  const parsed = productSchema.parse(data);
  await prisma.product.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      sku: parsed.sku,
      basePrice: parsed.basePrice,
      categoryId: parsed.categoryId,
      brandId: parsed.brandId || null,
    },
  });
  revalidatePath("/productos-admin");
  return { ok: true };
}

export async function updateProduct(data: ProductInput) {
  const parsed = productSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");
  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      sku: parsed.sku,
      basePrice: parsed.basePrice,
      categoryId: parsed.categoryId,
      brandId: parsed.brandId || null,
    },
  });
  revalidatePath("/productos-admin");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/productos-admin");
}
