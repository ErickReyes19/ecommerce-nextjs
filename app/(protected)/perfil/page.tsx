import Link from "next/link";
import { getSession } from "@/auth";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatHNL } from "@/src/lib/currency";
import { getOrCreateEcommerceUserBySessionUserId } from "@/src/lib/ecommerce-user";
import { getOrderStatusLabel } from "@/src/lib/order-status";
import { getPerfilData } from "./actions";

type PerfilPageProps = {
  searchParams?: {
    orderId?: string;
  };
};

export default async function PerfilPage({ searchParams }: PerfilPageProps) {
  const session = await getSession();

  if (!session?.IdUser) return <NoAcceso />;
  if (!session.Permiso?.includes("ver_facturas")) return <NoAcceso />;

  const ecommerceUser = await getOrCreateEcommerceUserBySessionUserId(session.IdUser);

  if (!ecommerceUser) {
    return (
      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
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
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Revisa tus pedidos y facturas en un solo lugar.</p>
      </div>

      {searchParams?.orderId ? (
        <p className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          ¡Pago completado! Tu pedido fue generado correctamente.
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Historial de pedidos</h2>

        {user?.orders.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {user.orders.map((order) => {
              const latestStatusDate = order.history[0]?.createdAt ?? order.createdAt;

              return (
                <Card key={order.id} className="border-border/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                      <Badge variant="secondary">{getOrderStatusLabel(order.status)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha</p>
                        <p className="font-medium">{latestStatusDate.toLocaleString("es-HN")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold">{formatHNL(Number(order.grandTotal))}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-muted-foreground">
                          {item.product.name} x{item.quantity} · {formatHNL(Number(item.totalPrice))}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aún no tienes pedidos.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Facturas</h2>

        {paidReceipts.length ? (
          <div className="space-y-3">
            {paidReceipts.map((receipt) => (
              <Card key={receipt.id}>
                <CardContent className="flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">Factura #{receipt.id.slice(0, 8)} · {receipt.orderNumber}</p>
                    <p className="text-muted-foreground">
                      {receipt.provider} · Ref: {receipt.providerRef ?? "N/A"}
                    </p>
                    <p className="text-muted-foreground">Fecha: {receipt.createdAt.toLocaleString("es-HN")}</p>
                  </div>

                  <div className="space-y-2 text-left md:text-right">
                    <p className="font-semibold">Total pagado: {formatHNL(Number(receipt.amount))}</p>
                    <Link className="text-primary underline" href={`/perfil?orderId=${receipt.orderId}`}>
                      Ver detalle del pedido
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay facturas disponibles todavía.</p>
        )}
      </section>
    </main>
  );
}
