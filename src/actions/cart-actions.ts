"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { cartUpdateSchema } from "@/src/lib/ecommerce-schemas";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getGuestToken() {
  const jar = cookies();
  const token = jar.get("guest_cart")?.value;
  if (token) return token;
  const created = crypto.randomUUID();
  jar.set("guest_cart", created, { httpOnly: true, sameSite: "lax", path: "/" });
  return created;
}

export async function getOrCreateGuestCart() {
  const token = await getGuestToken();
  const cart = await prisma.cart.upsert({ where: { token }, update: {}, create: { token } });
  return { token, cartId: cart.id };
}

export async function addToCart(input: { productId: string; variantId?: string; quantity: number }) {
  const parsed = cartUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: "Payload inválido" };
  const { productId, variantId, quantity } = parsed.data;

  const variant = variantId ? await prisma.productVariant.findUnique({ where: { id: variantId } }) : null;
  const stock = variant?.stock ?? 0;
  if (variantId && stock < quantity) return { error: "Stock insuficiente" };

  const { cartId } = await getOrCreateGuestCart();

  await prisma.cartItem.upsert({
    where: { cartId_productId_variantId: { cartId, productId, variantId: variantId ?? undefined } },
    update: { quantity: { increment: quantity } },
    create: { cartId, productId, variantId, quantity },
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


export async function syncLocalCart(items: Array<{ productId: string; variantId?: string; quantity: number }>) {
  const normalized = items
    .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0)
    .map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: Math.floor(item.quantity) }));

  if (normalized.length === 0) return { ok: true };

  const { cartId } = await getOrCreateGuestCart();

  for (const item of normalized) {
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId: item.productId,
          variantId: item.variantId ?? undefined,
        },
      },
      update: { quantity: { increment: item.quantity } },
      create: { cartId, productId: item.productId, variantId: item.variantId, quantity: item.quantity },
    });
  }

  revalidatePath("/carrito");
  return { ok: true };
}
