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

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Revisa tus pedidos en un solo lugar.</p>
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
    </main>
  );
}
