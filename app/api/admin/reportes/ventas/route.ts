import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    select: { createdAt: true, grandTotal: true },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const totalsByDay = new Map<string, number>();
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + Number(order.grandTotal));
  }

  const rows = Array.from(totalsByDay.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30)
    .map(([day, total]) => ({ day, total }));

  return Response.json(rows);
}
