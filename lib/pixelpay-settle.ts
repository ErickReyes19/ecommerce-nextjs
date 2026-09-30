import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PaymentMetadata = {
  reference: string;
  cartId?: string;
  userSessionId: string;
  hostedPaymentUrl?: string;
  providerResult?: unknown;
};

export function readPaymentMetadata(raw: string | null): Partial<PaymentMetadata> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PaymentMetadata;
  } catch {
    return {};
  }
}

/**
 * Marca el pago como PAID y aplica los efectos (stock, orden, cupón, carrito).
 * Idempotente: si complete y callback llegan a la vez, sólo el primero ejecuta los efectos.
 * Debe llamarse únicamente después de validar el payment_hash de PixelPay.
 */
export async function settlePixelPayPayment(paymentId: string, providerResult?: unknown) {
  const orderId = await prisma.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: paymentId, status: { not: "PAID" } },
      data: { status: "PAID" },
    });
    if (count === 0) return null;

    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { order: true } });
    const metadata = readPaymentMetadata(payment.rawPayload);

    const orderItems = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });
    for (const item of orderItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            variants: {
              updateMany: { where: { isDefault: true }, data: { stock: { decrement: item.quantity } } },
            },
          },
        });
      }
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: { rawPayload: JSON.stringify({ ...metadata, providerResult }) },
    });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: "PAGADO" } });
    await tx.orderHistory.create({
      data: { orderId: payment.orderId, status: "PAGADO", note: "Pago aprobado con PixelPay (Hosted)" },
    });

    if (payment.order.couponId) {
      await tx.coupon.update({ where: { id: payment.order.couponId }, data: { usedCount: { increment: 1 } } });
    }
    if (metadata.cartId) {
      await tx.cartItem.deleteMany({ where: { cartId: metadata.cartId } });
    }

    return payment.orderId;
  });

  if (orderId) {
    revalidatePath("/carrito");
    revalidatePath("/perfil");
  }

  return { alreadyProcessed: orderId === null };
}

/** Marca un pago PENDING como FAILED y cancela su orden. Nunca degrada un pago PAID. */
export async function failPixelPayPayment(paymentId: string, note: string, providerResult?: unknown) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.payment.updateMany({
      where: { id: paymentId, status: "PENDING" },
      data: { status: "FAILED" },
    });
    if (count === 0) return;

    const payment = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
    await tx.payment.update({
      where: { id: paymentId },
      data: { rawPayload: JSON.stringify({ ...readPaymentMetadata(payment.rawPayload), providerResult }) },
    });
    await tx.order.updateMany({ where: { id: payment.orderId, status: "PENDIENTE" }, data: { status: "CANCELADO" } });
    await tx.orderHistory.create({ data: { orderId: payment.orderId, status: "CANCELADO", note } });
  });
}
