import { prisma } from "@/lib/prisma";

export default async function PerfilPage() {
  const user = await prisma.user.findFirst({ include: { addresses: true, orders: { include: { items: true }, orderBy: { createdAt: "desc" } } } });

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Mi perfil</h1>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Direcciones</h2>
        {user?.addresses.map((address) => <div className="rounded border p-3" key={address.id}>{address.fullName} - {address.line1}</div>)}
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Historial de pedidos</h2>
        {user?.orders.map((order) => <div className="rounded border p-3" key={order.id}>{order.orderNumber} · {order.status} · ${Number(order.grandTotal).toFixed(2)}</div>)}
      </section>
    </main>
  );
}
