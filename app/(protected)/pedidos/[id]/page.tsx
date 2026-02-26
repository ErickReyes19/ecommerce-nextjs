import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHNL } from "@/src/lib/currency";
import { getOrderStatusLabel } from "@/src/lib/order-status";
import { ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";
import { getPedidoDetalleById } from "../actions";

export default async function PedidoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_pedidos_admin")) return <NoAcceso />;

  const { id } = await params;
  const pedido = await getPedidoDetalleById(id);
  if (!pedido) return notFound();

  return (
    <div className="container mx-auto space-y-4 py-2">
      <HeaderComponent
        Icon={ClipboardList}
        description="Detalle completo del pedido, productos, montos y dirección de facturación"
        screenName={`Pedido ${pedido.orderNumber}`}
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Resumen</CardTitle>
            <Badge variant="secondary">{getOrderStatusLabel(pedido.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Usuario</p>
            <p className="font-medium">{pedido.user?.name ?? pedido.user?.email ?? "Cliente no identificado"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha</p>
            <p className="font-medium">{pedido.createdAt.toLocaleString("es-HN")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cupón</p>
            <p className="font-medium">{pedido.coupon?.code ?? "No aplicado"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Descuento</p>
            <p className="font-medium">{formatHNL(Number(pedido.discountTotal))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Subtotal</p>
            <p className="font-medium">{formatHNL(Number(pedido.subtotal))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Envío</p>
            <p className="font-medium">{formatHNL(Number(pedido.shippingTotal))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Impuestos</p>
            <p className="font-medium">{formatHNL(Number(pedido.taxTotal))}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="font-semibold">{formatHNL(Number(pedido.grandTotal))}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Productos del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {pedido.items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-muted-foreground">Cantidad: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatHNL(Number(item.totalPrice))}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dirección de facturación</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {pedido.address ? (
            <div className="space-y-1">
              <p className="font-medium">{pedido.address.fullName}</p>
              <p>{pedido.address.line1}</p>
              {pedido.address.line2 ? <p>{pedido.address.line2}</p> : null}
              <p>{pedido.address.city}, {pedido.address.state} {pedido.address.postalCode}</p>
              <p>{pedido.address.country}</p>
              {pedido.address.phone ? <p>Tel: {pedido.address.phone}</p> : null}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay dirección de facturación registrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
