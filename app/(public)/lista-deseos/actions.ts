"use server";

import { prisma } from "@/lib/prisma";

export async function getWishlistProducts(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              category: true,
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
    },
  });

  return (wishlist?.items ?? []).filter((item) => item.product.active);
}
