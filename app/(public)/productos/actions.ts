"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

export async function getProductosCatalogo(
  where: Prisma.ProductWhereInput,
  orderBy: Prisma.ProductOrderByWithRelationInput,
  page: number,
  pageSize: number,
) {
  const currentPage = Math.max(1, page);
  const take = Math.max(1, pageSize);
  const skip = (currentPage - 1) * take;

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
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return { categories, brands, products, totalCount };
}
