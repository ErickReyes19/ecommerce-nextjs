import Link from "next/link";
import { deletePedido, getPedidos } from "./actions";

export default async function AdminPedidosPage() {
  const orders = await getPedidos();
  return (
    <main className="space-y-3">
      <Link href="/protected/pedidos/create" className="underline">Nuevo pedido</Link>
      {orders.map((o) => (
        <div key={o.id} className="rounded border p-3 flex items-center justify-between">
          <div>{o.orderNumber} · {o.status} · ${Number(o.grandTotal).toFixed(2)}</div>
          <div className="flex gap-2">
            <Link href={`/protected/pedidos/${o.id}/edit`} className="underline">Editar</Link>
            <form action={deletePedido.bind(null, o.id)}><button className="underline" type="submit">Eliminar</button></form>
          </div>
        </div>
      ))}
    </main>
  );
}
