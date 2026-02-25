import HeaderComponent from "@/components/HeaderComponent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { LayoutDashboard } from "lucide-react";

export default async function AdminDashboardPage() {
  const [products, orders, users] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.user.count()]);

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={LayoutDashboard} description="Resumen general del panel administrativo" screenName="Dashboard" />
      <main className="grid gap-4 md:grid-cols-3">
        {[{ label: "Productos", value: products }, { label: "Pedidos", value: orders }, { label: "Usuarios", value: users }].map((kpi) => (
          <Card key={kpi.label}><CardHeader><CardTitle>{kpi.label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{kpi.value}</CardContent></Card>
        ))}
      </main>
    </div>
  );
}
