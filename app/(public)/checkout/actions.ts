"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateEcommerceUserBySessionUserId } from "@/src/lib/ecommerce-user";

export async function getCheckoutData(token: string | undefined, sessionUserId: string) {
  const ecommerceUser = await getOrCreateEcommerceUserBySessionUserId(sessionUserId);

  const cart = token
    ? await prisma.cart.findUnique({
        where: { token },
        include: { items: { include: { product: true, variant: true } } },
      })
    : ecommerceUser
      ? await prisma.cart.findFirst({
          where: { userId: ecommerceUser.id },
          include: { items: { include: { product: true, variant: true } } },
          orderBy: { updatedAt: "desc" },
        })
      : null;

  if (cart) {
    const inactiveItemIds = cart.items.filter((item) => !item.product.active).map((item) => item.id);
    if (inactiveItemIds.length > 0) {
      await prisma.cartItem.deleteMany({ where: { id: { in: inactiveItemIds } } });
      cart.items = cart.items.filter((item) => item.product.active);
    }
  }

  const [methods, currentUser] = await Promise.all([
    prisma.shippingMethod.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.usuario.findUnique({
      where: { id: sessionUserId },
      select: { nombre: true, email: true, telefono: true, direccion: true, ciudad: true },
    }),
  ]);

  return { cart, methods, currentUser };
}
