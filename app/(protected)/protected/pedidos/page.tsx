import { prisma } from "@/lib/prisma";

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
  return <main className="space-y-2">{orders.map((o) => <div key={o.id} className="rounded border p-3">{o.orderNumber} · {o.status} · ${Number(o.grandTotal).toFixed(2)}</div>)}</main>;
}
