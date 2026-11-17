import { getSessionPermisos } from "@/auth";
import { prisma } from "@/lib/prisma";

// Consulta la BD en cada request; sin esto Next la prerenderiza en el build y falla si no hay conexión
export const dynamic = "force-dynamic";

export async function GET() {
  const permisos = await getSessionPermisos();
  if (!permisos?.includes("ver_reportes_admin")) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

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
