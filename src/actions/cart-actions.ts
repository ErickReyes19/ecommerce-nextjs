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

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, active: true } });
  if (!product || !product.active) return { error: "Este producto no está disponible" };

  const variant = variantId
    ? await prisma.productVariant.findFirst({ where: { id: variantId, productId }, select: { id: true, stock: true } })
    : null;
  if (variantId && !variant) return { error: "Variante inválida para este producto" };
  const stock = variant?.stock ?? 0;
  if (variantId && stock < quantity) return { error: "Stock insuficiente" };

  const { cartId } = await getOrCreateGuestCart();

  const normalizedVariantId = variantId ?? undefined;

  await prisma.cartItem.upsert({
    where: { cartId_productId_variantId: { cartId, productId, variantId: normalizedVariantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId, productId, variantId: normalizedVariantId, quantity },
  });

  revalidatePath("/carrito");
  return { ok: true };
}

export async function updateCartItem(itemId: string, quantity: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { product: { select: { active: true, name: true } }, variant: { select: { stock: true } } },
  });

  if (!item) return;
  if (!item.product.active) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/carrito");
    return;
  }

  if (item.variant && item.variant.stock < quantity) return;

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
    const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { id: true, active: true } });
    if (!product?.active) continue;

    const variant = item.variantId
      ? await prisma.productVariant.findFirst({ where: { id: item.variantId, productId: item.productId }, select: { id: true, stock: true } })
      : null;
    if (item.variantId && !variant) continue;
    if (variant && variant.stock < item.quantity) continue;

    const normalizedVariantId = item.variantId ?? undefined;

    await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId: item.productId,
          variantId: normalizedVariantId,
        },
      },
      update: { quantity: item.quantity },
      create: { cartId, productId: item.productId, variantId: normalizedVariantId, quantity: item.quantity },
    });
  }

  revalidatePath("/carrito");
  return { ok: true };
}

export async function removeInactiveItemsFromCart(cartId: string) {
  const inactiveItems = await prisma.cartItem.findMany({
    where: { cartId, product: { active: false } },
    select: { id: true },
  });

  if (inactiveItems.length === 0) return 0;

  await prisma.cartItem.deleteMany({ where: { id: { in: inactiveItems.map((item) => item.id) } } });
  revalidatePath("/carrito");
  revalidatePath("/checkout");
  return inactiveItems.length;
}
