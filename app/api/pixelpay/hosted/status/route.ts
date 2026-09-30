import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readPaymentMetadata } from "@/lib/pixelpay-settle";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) return NextResponse.json({ ok: false }, { status: 401 });

  const paymentId = new URL(request.url).searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ ok: false }, { status: 400 });

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      orderId: true,
      rawPayload: true,
      order: { select: { orderNumber: true, grandTotal: true } },
    },
  });

  if (!payment || readPaymentMetadata(payment.rawPayload).userSessionId !== session.IdUser) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    status: payment.status,
    orderId: payment.orderId,
    orderNumber: payment.order.orderNumber,
    grandTotal: Number(payment.order.grandTotal),
  });
}
