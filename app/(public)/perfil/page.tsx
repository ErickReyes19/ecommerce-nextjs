import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/auth";
import NoAcceso from "@/components/noAccess";
import { formatHNL } from "@/src/lib/currency";
import { getOrCreateEcommerceUserBySessionUserId } from "@/src/lib/ecommerce-user";
import { getOrderStatusLabel } from "@/src/lib/order-status";
import { getPerfilData } from "./actions";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams?: { orderId?: string };
}) {
  const session = await getSession();
  if (!session?.IdUser) {
    redirect("/login?callbackUrl=/perfil");
  }

  if (!session.Permiso?.includes("ver_facturas")) return <NoAcceso />;

  const ecommerceUser = await getOrCreateEcommerceUserBySessionUserId(session.IdUser);

  if (!ecommerceUser) {
    return (
      <main className="container mx-auto space-y-8 px-4 py-8">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          No se pudo cargar la información de e-commerce para este usuario.
        </p>
      </main>
    );
  }

  const user = await getPerfilData(ecommerceUser.id);

  const paidReceipts =
    user?.orders
      .flatMap((order) =>
        order.payments
          .filter((payment) => payment.status === "PAID")
          .map((payment) => ({
            id: payment.id,
            createdAt: payment.createdAt,
            amount: payment.amount,
            currency: payment.currency,
            provider: payment.provider,
            providerRef: payment.providerRef,
            orderId: order.id,
            orderNumber: order.orderNumber,
          })),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) ?? [];

  return (
    <main className="container mx-auto space-y-8 px-4 py-8">
      <h1 className="text-3xl font-bold">Mi perfil</h1>

      {searchParams?.orderId ? (
        <p className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          ¡Pago completado! Tu pedido fue generado correctamente.
        </p>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Direcciones</h2>
        {user?.addresses.length ? (
          user.addresses.map((address) => (
            <div className="rounded border p-3" key={address.id}>
              {address.fullName} - {address.line1}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tienes direcciones registradas.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Historial de pedidos</h2>
        {user?.orders.length ? (
          user.orders.map((order) => (
            <article className="space-y-2 rounded border p-3" key={order.id}>
              <p className="font-medium">
                {order.orderNumber} · {getOrderStatusLabel(order.status)} · {formatHNL(Number(order.grandTotal))}
              </p>
              <ul className="list-inside list-disc text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} x{item.quantity} · {formatHNL(Number(item.totalPrice))}
                  </li>
                ))}
              </ul>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Aún no tienes pedidos.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Recibos y facturas</h2>
        {paidReceipts.length ? (
          paidReceipts.map((receipt) => (
            <article key={receipt.id} className="rounded border p-3 text-sm">
              <p className="font-medium">
                Recibo #{receipt.id.slice(0, 8)} · Pedido {receipt.orderNumber}
              </p>
              <p className="text-muted-foreground">
                {receipt.provider} · Ref: {receipt.providerRef ?? "N/A"}
              </p>
              <p className="text-muted-foreground">Total pagado: {formatHNL(Number(receipt.amount))}</p>
              <p className="text-muted-foreground">Fecha: {receipt.createdAt.toLocaleString("es-HN")}</p>
              <Link className="text-primary underline" href={`/perfil?orderId=${receipt.orderId}`}>
                Ver detalle del pedido
              </Link>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No hay recibos disponibles todavía.</p>
        )}
      </section>
    </main>
  );
}
