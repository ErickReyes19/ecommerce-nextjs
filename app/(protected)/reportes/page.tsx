import { getSessionPermisos } from "@/auth";
import HeaderComponent from "@/components/HeaderComponent";
import NoAcceso from "@/components/noAccess";
import { FileBarChart } from "lucide-react";
import { formatHNL } from "@/src/lib/currency";
import { getOrderStatusLabel } from "@/src/lib/order-status";
import { getReportesData } from "./actions";
import { ReportesCharts } from "./components/reportes-charts";

export default async function AdminReportesPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_reportes_admin")) return <NoAcceso />;

  const { orders, topProducts, productNames } = await getReportesData();
  const nameMap = new Map(productNames.map((p) => [p.id, p.name]));

  const ventasMap = new Map<string, number>();
  for (const order of orders) {
    const fecha = order.createdAt.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit" });
    ventasMap.set(fecha, (ventasMap.get(fecha) ?? 0) + Number(order.grandTotal));
  }

  const ventasPorDia = Array.from(ventasMap.entries())
    .map(([fecha, total]) => ({ fecha, total }))
    .reverse();

  const topProductosChart = topProducts.map((product) => ({
    nombre: nameMap.get(product.productId) ?? product.productId,
    unidades: Number(product._sum.quantity ?? 0),
  }));


  return (
    <div className="space-y-4">
      <HeaderComponent Icon={FileBarChart} description="Reporte detallado de movimientos de pedidos" screenName="Reportes" />

      <ReportesCharts ventasPorDia={ventasPorDia} topProductos={topProductosChart} />

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
