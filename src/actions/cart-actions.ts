"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { cartUpdateSchema } from "@/src/lib/ecommerce-schemas";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function getGuestToken() {
  const jar = cookies();
  const token = jar.get("guest_cart")?.value;
  if (token) return token;
  const created = crypto.randomUUID();
  jar.set("guest_cart", created, { httpOnly: true, sameSite: "lax", path: "/" });
  return created;
}

export async function addToCart(input: { productId: string; variantId?: string; quantity: number }) {
  const parsed = cartUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Payload inválido" };
  const { productId, variantId, quantity } = parsed.data;

  const variant = variantId ? await prisma.productVariant.findUnique({ where: { id: variantId } }) : null;
  const stock = variant?.stock ?? 0;
  if (variantId && stock < quantity) return { error: "Stock insuficiente" };

  const token = await getGuestToken();
  const cart = await prisma.cart.upsert({ where: { token }, update: {}, create: { token } });

  await prisma.cartItem.upsert({
    where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: variantId ?? null } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, variantId, quantity },
  });

  revalidatePath("/carrito");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  revalidatePath("/carrito");
}

export async function removeCartItem(itemId: string) {
  await prisma.cartItem.delete({ where: { id: itemId } });
  revalidatePath("/carrito");
}
