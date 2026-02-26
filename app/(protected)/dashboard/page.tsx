import HeaderComponent from "@/components/HeaderComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NoAcceso from "@/components/noAccess";
import { formatHNL } from "@/src/lib/currency";
import { getSessionPermisos } from "@/auth";
import { LayoutDashboard } from "lucide-react";
import { getDashboardKpis } from "./actions";
import { DashboardCharts } from "./components/dashboard-charts";

export default async function AdminDashboardPage() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_dashboard")) return <NoAcceso />;
  const {
    products,
    orders,
    users,
    paidOrders,
    activeCoupons,
    activeShippingMethods,
    sales,
    salesByCategory,
    orderStatusDistribution,
  } = await getDashboardKpis();

  const conversionRate = orders > 0 ? (paidOrders / orders) * 100 : 0;

  const kpis = [
    { label: "Productos", value: products.toString() },
    { label: "Pedidos totales", value: orders.toString() },
    { label: "Pedidos pagados", value: paidOrders.toString() },
    { label: "Tasa de pago", value: `${conversionRate.toFixed(1)}%` },
    { label: "Usuarios", value: users.toString() },
    { label: "Cupones activos", value: activeCoupons.toString() },
    { label: "Métodos de envío activos", value: activeShippingMethods.toString() },
    { label: "Venta acumulada", value: formatHNL(sales) },
  ];

  return (
    <div className="space-y-4">
      <HeaderComponent
        Icon={LayoutDashboard}
        description="Resumen general del panel administrativo"
        screenName="Dashboard"
      />
      <main className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{kpi.value}</CardContent>
          </Card>
        ))}
      </main>
      <DashboardCharts
        orderStatusDistribution={orderStatusDistribution}
        salesByCategory={salesByCategory}
      />
    </div>
  );
}
