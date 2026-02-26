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
  const { products, orders, users, paidOrders, activeCoupons, activeShippingMethods, sales } = await getDashboardKpis();

  const kpis = [
    { label: "Productos", value: products.toString(), chartValue: products },
    { label: "Pedidos totales", value: orders.toString(), chartValue: orders },
    { label: "Pedidos pagados", value: paidOrders.toString(), chartValue: paidOrders },
    { label: "Usuarios", value: users.toString(), chartValue: users },
    { label: "Cupones activos", value: activeCoupons.toString(), chartValue: activeCoupons },
    { label: "Métodos de envío activos", value: activeShippingMethods.toString(), chartValue: activeShippingMethods },
    { label: "Venta acumulada", value: formatHNL(sales), chartValue: sales },
  ];

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={LayoutDashboard} description="Resumen general del panel administrativo" screenName="Dashboard" />
      <main className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}><CardHeader><CardTitle>{kpi.label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{kpi.value}</CardContent></Card>
        ))}
      </main>
      <DashboardCharts kpis={kpis.map((kpi) => ({ label: kpi.label, value: kpi.chartValue }))} />
    </div>
  );
}
