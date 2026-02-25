import { prisma } from "@/lib/prisma";

export async function GET() {
  const orderItems = await prisma.orderItem.findMany({
    select: {
      quantity: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    take: 5000,
  });

  const unitsByProduct = new Map<string, number>();
  for (const item of orderItems) {
    const name = item.product.name;
    unitsByProduct.set(name, (unitsByProduct.get(name) ?? 0) + item.quantity);
  }

  const rows = Array.from(unitsByProduct.entries())
    .sort(([, unitsA], [, unitsB]) => unitsB - unitsA)
    .slice(0, 10)
    .map(([name, units]) => ({ name, units }));

  return Response.json(rows);
}
