import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, verifyPaymentHash } from "@/lib/pixelpay-hosted";
import { settlePixelPayPayment } from "@/lib/pixelpay-settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get("paymentId") ?? "";
  const paymentHash =
    url.searchParams.get("paymentHash") ?? url.searchParams.get("payment_hash") ?? url.searchParams.get("hash");
  console.info("[pixelpay/complete] params recibidos", Object.fromEntries(url.searchParams.entries()));
  const go = (status: "success" | "error") =>
    NextResponse.redirect(
      `${getAppBaseUrl(request)}/checkout/resultado?paymentId=${encodeURIComponent(paymentId)}&status=${status}`,
      303,
    );

  const payment = paymentId ? await prisma.payment.findUnique({ where: { id: paymentId } }) : null;
  if (!payment?.providerRef) return go("error");

  if (!verifyPaymentHash(payment.providerRef, paymentHash)) {
    console.warn("[pixelpay/complete] paymentHash inválido", { paymentId });
    return go("error");
  }

  await settlePixelPayPayment(payment.id, { source: "complete", paymentHash });
  return go("success");
}
