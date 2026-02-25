import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [products, orders, users] = await Promise.all([prisma.product.count(), prisma.order.count(), prisma.user.count()]);
  return (
    <main className="grid gap-4 md:grid-cols-3">
      {[{ label: "Productos", value: products }, { label: "Pedidos", value: orders }, { label: "Usuarios", value: users }].map((kpi) => (
        <Card key={kpi.label}><CardHeader><CardTitle>{kpi.label}</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{kpi.value}</CardContent></Card>
      ))}
    </main>
  );
}
