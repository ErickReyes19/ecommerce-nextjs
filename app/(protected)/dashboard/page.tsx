import HeaderComponent from "@/components/HeaderComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatHNL } from "@/src/lib/currency";
import { LayoutDashboard } from "lucide-react";

export default async function AdminDashboardPage() {
  const [products, orders, users, paidOrders, activeCoupons, activeShippingMethods] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: "PAGADO" } }),
    prisma.coupon.count({ where: { active: true } }),
    prisma.shippingMethod.count({ where: { active: true } }),
  ]);

  const sales = await prisma.order.aggregate({
    _sum: { grandTotal: true },
    where: { status: "PAGADO" },
  });

  const kpis = [
    { label: "Productos", value: products.toString() },
    { label: "Pedidos totales", value: orders.toString() },
    { label: "Pedidos pagados", value: paidOrders.toString() },
    { label: "Usuarios", value: users.toString() },
    { label: "Cupones activos", value: activeCoupons.toString() },
    { label: "Métodos de envío activos", value: activeShippingMethods.toString() },
    { label: "Venta acumulada", value: formatHNL(Number(sales._sum.grandTotal ?? 0)) },
  ];

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={LayoutDashboard} description="Resumen general del panel administrativo" screenName="Dashboard" />
      <main className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}><CardHeader><CardTitle>{kpi.label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{kpi.value}</CardContent></Card>
        ))}
      </main>
    </div>
  );
}
