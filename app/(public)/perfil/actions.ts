"use server";

import { prisma } from "@/lib/prisma";

export async function getPerfilData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { orderBy: { createdAt: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: { select: { name: true } } } },
          payments: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
}
