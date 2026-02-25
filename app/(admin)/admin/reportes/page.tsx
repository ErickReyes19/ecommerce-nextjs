import { prisma } from "@/lib/prisma";

export default async function AdminReportesPage() {
  const salesByDay = await prisma.$queryRaw<Array<{ day: string; total: number }>>`SELECT DATE(createdAt) as day, SUM(grandTotal) as total FROM \`Order\` GROUP BY DATE(createdAt) ORDER BY day DESC LIMIT 15`;
  return <main className="space-y-2">{salesByDay.map((r) => <div key={r.day} className="rounded border p-3">{r.day}: ${Number(r.total).toFixed(2)}</div>)}</main>;
}
