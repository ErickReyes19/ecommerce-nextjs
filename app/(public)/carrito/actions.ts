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

  if (cart) {
    const inactiveItemIds = cart.items.filter((item) => !item.product.active).map((item) => item.id);
    if (inactiveItemIds.length > 0) {
      await prisma.cartItem.deleteMany({ where: { id: { in: inactiveItemIds } } });
      cart.items = cart.items.filter((item) => item.product.active);
    }
  }

  const items = cart?.items ?? [];
  const cartProductIds = items.map((item) => item.productId);
  const cartCategoryIds = Array.from(new Set(items.map((item) => item.product.categoryId)));

  const recommendedProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: cartProductIds.length ? cartProductIds : undefined },
      ...(cartCategoryIds.length ? { categoryId: { in: cartCategoryIds } } : {}),
    },
    include: {
      category: { select: { name: true } },
      images: { where: { isMain: true }, take: 1 },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return { cart, recommendedProducts };
}
