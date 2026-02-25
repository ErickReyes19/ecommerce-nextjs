import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return Response.json({ error: "Orden no encontrada" }, { status: 404 });

  return Response.json({
    checkoutUrl: `https://checkout.stripe.com/pay/mock-session-${order.id}`,
    note: "Placeholder: integrar stripe SDK usando STRIPE_SECRET_KEY",
  });
}
