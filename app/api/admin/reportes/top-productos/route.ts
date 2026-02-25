import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.$queryRaw<Array<{ name: string; units: number }>>`SELECT p.name as name, SUM(oi.quantity) as units FROM OrderItem oi JOIN Product p on p.id = oi.productId GROUP BY p.name ORDER BY units DESC LIMIT 10`;
  return Response.json(rows);
}
