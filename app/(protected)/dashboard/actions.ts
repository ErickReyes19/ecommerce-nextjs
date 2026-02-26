"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardKpis() {
  const [products, orders, users, paidOrders, activeCoupons, activeShippingMethods, sales] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.count({ where: { status: "PAGADO" } }),
    prisma.coupon.count({ where: { active: true } }),
    prisma.shippingMethod.count({ where: { active: true } }),
    prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: "PAGADO" } }),
  ]);

  return { products, orders, users, paidOrders, activeCoupons, activeShippingMethods, sales: Number(sales._sum.grandTotal ?? 0) };
}
