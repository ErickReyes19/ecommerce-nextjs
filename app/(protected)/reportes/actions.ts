"use server";

import { prisma } from "@/lib/prisma";

export async function getReportesData() {
  const [orders, topProducts] = await Promise.all([
    prisma.order.findMany({
      select: { createdAt: true, grandTotal: true, orderNumber: true, status: true, discountTotal: true, shippingTotal: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const productNames = await prisma.product.findMany({ where: { id: { in: topProducts.map((item) => item.productId) } }, select: { id: true, name: true } });
  return { orders, topProducts, productNames };
}
