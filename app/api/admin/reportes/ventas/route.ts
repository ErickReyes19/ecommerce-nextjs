import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.$queryRaw<Array<{ day: string; total: number }>>`SELECT DATE(createdAt) as day, SUM(grandTotal) as total FROM \`Order\` GROUP BY DATE(createdAt) ORDER BY day DESC LIMIT 30`;
  return Response.json(rows);
}
