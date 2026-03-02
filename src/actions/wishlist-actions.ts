"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/auth";

async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function getWishlistProductIdsForCurrentUser() {
  const session = await getSession();
  if (!session?.IdUser) return [] as string[];

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.IdUser },
    select: { items: { select: { productId: true } } },
  });

  return wishlist?.items.map((item) => item.productId) ?? [];
}

export async function toggleWishlistItem(productId: string) {
  const session = await getSession();
  if (!session?.IdUser) return { error: "Debes iniciar sesión para usar tu lista de deseos" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, active: true },
  });

  if (!product?.active) return { error: "Este producto no está disponible" };

  const wishlist = await getOrCreateWishlist(session.IdUser);

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
    select: { id: true },
  });

  let action: "added" | "removed" = "added";

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    action = "removed";
  } else {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });
  }

  revalidatePath("/productos");

  return { ok: true, action };
}

export async function syncLocalWishlist(productIds: string[]) {
  const session = await getSession();
  if (!session?.IdUser) return { ok: false, error: "UNAUTHORIZED" };

  const normalizedIds = Array.from(new Set(productIds.filter((id) => typeof id === "string" && id.length > 0)));
  if (normalizedIds.length === 0) return { ok: true };

  const activeProducts = await prisma.product.findMany({
    where: { id: { in: normalizedIds }, active: true },
    select: { id: true },
  });

  if (activeProducts.length === 0) return { ok: true };

  const wishlist = await getOrCreateWishlist(session.IdUser);

  for (const product of activeProducts) {
    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id,
        },
      },
      update: {},
      create: { wishlistId: wishlist.id, productId: product.id },
    });
  }

  revalidatePath("/productos");

  return { ok: true };
}
