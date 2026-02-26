"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getProductosCatalogo(where: Prisma.ProductWhereInput, orderBy: Prisma.ProductOrderByWithRelationInput) {
  const [categories, brands, products, totalCount] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: { where: { active: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      include: { _count: { select: { products: { where: { active: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where,
      include: { category: true, brand: true, images: { where: { isMain: true }, take: 1 } },
      orderBy,
      take: 24,
    }),
    prisma.product.count({ where }),
  ]);

  return { categories, brands, products, totalCount };
}
