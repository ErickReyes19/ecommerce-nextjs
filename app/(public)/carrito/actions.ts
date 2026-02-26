"use server";

import { prisma } from "@/lib/prisma";

export async function getCartWithRecommendations(token?: string) {
  const cart = token
    ? await prisma.cart.findUnique({
        where: { token },
        include: {
          items: {
            include: {
              product: { include: { images: { where: { isMain: true }, take: 1 }, category: true } },
              variant: true,
            },
          },
        },
      })
    : null;

  const items = cart?.items ?? [];
  const cartProductIds = items.map((item) => item.productId);
  const cartCategoryIds = Array.from(new Set(items.map((item) => item.product.categoryId)));

  const recommendedProducts = cartCategoryIds.length
    ? await prisma.product.findMany({
        where: {
          active: true,
          categoryId: { in: cartCategoryIds },
          id: { notIn: cartProductIds.length ? cartProductIds : undefined },
        },
        include: {
          category: { select: { name: true } },
          images: { where: { isMain: true }, take: 1 },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : [];

  return { cart, recommendedProducts };
}
