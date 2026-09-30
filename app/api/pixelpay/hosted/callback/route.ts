import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaymentHash } from "@/lib/pixelpay-hosted";
import { failPixelPayPayment, settlePixelPayPayment } from "@/lib/pixelpay-settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    return form ? Object.fromEntries(form.entries()) : null;
  }
  return (await request.json().catch(() => null)) as Record<string, unknown> | null;
}

export async function POST(request: Request) {
  const result = await readBody(request);
  console.info("[pixelpay/callback] body recibido", {
    contentType: request.headers.get("content-type"),
    body: result,
  });
  const reference =
    typeof result?.order === "string" ? result.order : typeof result?.ref === "string" ? result.ref : null;
  if (!reference) return NextResponse.json({ ok: false }, { status: 400 });

  // La firma va ANTES de consultar la BD: sin ella cualquiera podría marcar una orden como pagada
  const paymentHash = typeof result?.payment_hash === "string" ? result.payment_hash : null;
  if (!verifyPaymentHash(reference, paymentHash)) {
    console.warn("[pixelpay/callback] firma inválida", { reference });
    return NextResponse.json({ ok: false, message: "Firma inválida" }, { status: 403 });
  }

  const payment = await prisma.payment.findFirst({ where: { provider: "PIXELPAY", providerRef: reference } });
  if (!payment) return NextResponse.json({ ok: false }, { status: 404 });

  if (String(result?.status ?? "").toLowerCase() === "paid") {
    await settlePixelPayPayment(payment.id, result);
  } else {
    await failPixelPayPayment(payment.id, "Pago rechazado por PixelPay", result);
  }

  return NextResponse.json({ ok: true });
}
