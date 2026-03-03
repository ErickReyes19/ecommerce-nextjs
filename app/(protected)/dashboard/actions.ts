"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardKpis() {
  const [products, orders, users, paidOrders, activeCoupons, activeShippingMethods, sales, ordersByStatus, orderItems] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.usuario.count(),
      prisma.order.count({ where: { status: "PAGADO" } }),
      prisma.coupon.count({ where: { active: true } }),
      prisma.shippingMethod.count({ where: { active: true } }),
      prisma.order.aggregate({ _sum: { grandTotal: true }, where: { status: "PAGADO" } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.orderItem.groupBy({ by: ["productId"], _sum: { totalPrice: true, quantity: true } }),
    ]);

  const productIds = orderItems.map((item) => item.productId);
  const productsWithCategory = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, category: { select: { name: true } } },
      })
    : [];

  const categoryByProductId = new Map(
    productsWithCategory.map((product) => [product.id, product.category.name]),
  );

  const categoryAccumulator = new Map<string, { revenue: number; units: number }>();
  for (const item of orderItems) {
    const category = categoryByProductId.get(item.productId) ?? "Sin categoría";
    const previous = categoryAccumulator.get(category) ?? { revenue: 0, units: 0 };
    categoryAccumulator.set(category, {
      revenue: previous.revenue + Number(item._sum.totalPrice ?? 0),
      units: previous.units + Number(item._sum.quantity ?? 0),
    });
  }

  const salesByCategory = Array.from(categoryAccumulator.entries())
    .map(([category, totals]) => ({ category, ...totals }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const statusLabels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    PAGADO: "Pagado",
    PROCESANDO: "Procesando",
    ENVIADO: "Enviado",
    CANCELADO: "Cancelado",
  };

  const orderStatusDistribution = ordersByStatus
    .map((item) => ({
      status: statusLabels[item.status] ?? item.status,
      total: item._count._all,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    products,
    orders,
    users,
    paidOrders,
    activeCoupons,
    activeShippingMethods,
    sales: Number(sales._sum.grandTotal ?? 0),
    salesByCategory,
    orderStatusDistribution,
  };
}
