import { NextResponse } from "next/server";
import { getAppBaseUrl } from "@/lib/pixelpay-hosted";
import { failPixelPayPayment } from "@/lib/pixelpay-settle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const paymentId = new URL(request.url).searchParams.get("paymentId");
  if (paymentId) {
    await failPixelPayPayment(paymentId, "Pago cancelado por el cliente en PixelPay", { status: "cancelled" });
  }
  return NextResponse.redirect(`${getAppBaseUrl(request)}/carrito?pago=cancelado`, 303);
}
