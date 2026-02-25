import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) return Response.json({ error: "Firma faltante" }, { status: 400 });

  // TODO: validar firma con STRIPE_WEBHOOK_SECRET y stripe.webhooks.constructEvent
  const parsed = JSON.parse(body) as { type?: string; data?: { object?: { metadata?: { orderId?: string } } } };

  if (parsed.type === "checkout.session.completed") {
    const orderId = parsed.data?.object?.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "PAGADO", history: { create: { status: "PAGADO", note: "Webhook Stripe" } } } });
    }
  }

  return Response.json({ received: true });
}
