import HeaderComponent from "@/components/HeaderComponent";
import { prisma } from "@/lib/prisma";
import { FileBarChart } from "lucide-react";
import { formatHNL } from "@/src/lib/currency";
import { getOrderStatusLabel } from "@/src/lib/order-status";

export default async function AdminReportesPage() {
  const [orders, topProducts] = await Promise.all([
    prisma.order.findMany({
      select: { createdAt: true, grandTotal: true, orderNumber: true, status: true, discountTotal: true, shippingTotal: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const productNames = await prisma.product.findMany({ where: { id: { in: topProducts.map((item) => item.productId) } }, select: { id: true, name: true } });
  const nameMap = new Map(productNames.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={FileBarChart} description="Reporte detallado de movimientos de pedidos" screenName="Reportes" />

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Últimas operaciones</h2>
        {orders.map((order) => (
          <div key={order.orderNumber} className="rounded border p-3 text-sm">
            <p className="font-medium">{order.orderNumber} · {getOrderStatusLabel(order.status)}</p>
            <p className="text-muted-foreground">Fecha: {order.createdAt.toLocaleString("es-HN")}</p>
            <p className="text-muted-foreground">Total: {formatHNL(Number(order.grandTotal))}</p>
            <p className="text-muted-foreground">Descuento aplicado: {formatHNL(Number(order.discountTotal))}</p>
            <p className="text-muted-foreground">Costo de envío: {formatHNL(Number(order.shippingTotal))}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Top productos vendidos</h2>
        {topProducts.map((product) => (
          <div key={product.productId} className="rounded border p-3 text-sm">
            <p className="font-medium">{nameMap.get(product.productId) ?? product.productId}</p>
            <p className="text-muted-foreground">Unidades: {product._sum.quantity ?? 0}</p>
            <p className="text-muted-foreground">Facturación: {formatHNL(Number(product._sum.totalPrice ?? 0))}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
