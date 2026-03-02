"use server";

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/src/lib/ecommerce-schemas";
import { revalidatePath } from "next/cache";
import { dispatchOrderToProviders } from "@/src/lib/provider-dispatch";

export async function createOrder(payload: unknown, cartId: string) {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { variant: true, product: true } } } });
  if (!cart || cart.items.length === 0) return { error: "Carrito vacío" };

  const inactiveItems = cart.items.filter((item) => !item.product.active);
  if (inactiveItems.length > 0) {
    await prisma.cartItem.deleteMany({ where: { id: { in: inactiveItems.map((item) => item.id) } } });
    return { error: "Se eliminaron productos inactivos del carrito. Revisa tu carrito e intenta de nuevo." };
  }

  for (const item of cart.items) {
    if (item.variant && item.variant.stock < item.quantity) return { error: `Stock insuficiente para ${item.product.name}` };
  }

  const subtotal = cart.items.reduce((acc, item) => acc + Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity, 0);
  const shipping = await prisma.shippingMethod.findUnique({ where: { id: parsed.data.shippingMethodId } });
  const shippingTotal = Number(shipping?.price ?? 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: "PENDIENTE",
      addressId: parsed.data.addressId,
      subtotal,
      shippingTotal,
      grandTotal: subtotal + shippingTotal,
      items: {
        create: cart.items.map((item) => {
          const unitPrice = Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice);
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          };
        }),
      },
      history: { create: { status: "PENDIENTE", note: "Orden creada desde checkout" } },
    },
  });

  await dispatchOrderToProviders(order.id);

  revalidatePath("/perfil");
  return { ok: true, orderId: order.id };
}

export async function generateInvoicePdf(_orderId: string) {
  return { message: "TODO: integrar pdfkit o @react-pdf/renderer para factura final" };
}
