import HeaderComponent from "@/components/HeaderComponent";
import { prisma } from "@/lib/prisma";
import { FileBarChart } from "lucide-react";
import { formatHNL } from "@/src/lib/currency";

export default async function AdminReportesPage() {
  const orders = await prisma.order.findMany({ select: { createdAt: true, grandTotal: true }, orderBy: { createdAt: "desc" }, take: 500 });

  const dailyTotals = new Map<string, number>();
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    dailyTotals.set(day, (dailyTotals.get(day) ?? 0) + Number(order.grandTotal));
  }

  const salesByDay = Array.from(dailyTotals.entries()).sort(([a], [b]) => b.localeCompare(a)).slice(0, 15).map(([day, total]) => ({ day, total }));

  return (
    <div className="space-y-4">
      <HeaderComponent Icon={FileBarChart} description="Consulta de ventas agregadas por día" screenName="Reportes" />
      <main className="space-y-2">{salesByDay.map((r) => <div key={r.day} className="rounded border p-3">{r.day}: {formatHNL(Number(r.total))}</div>)}</main>
    </div>
  );
}
