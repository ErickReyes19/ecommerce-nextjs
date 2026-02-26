"use server";

import { prisma } from "@/lib/prisma";

export async function getProductMetadata(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include: { category: true } });
}

export async function getProductDetail(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { isDefault: "desc" } },
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
      attributes: { include: { attribute: true, attributeValue: true } },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: productId }, active: true },
    include: { category: true, images: { where: { isMain: true }, take: 1 } },
    take: 4,
  });
}
