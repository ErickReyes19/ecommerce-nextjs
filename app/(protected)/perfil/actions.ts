"use server";

import { prisma } from "@/lib/prisma";

export async function getPerfilData(userId: string) {
  return prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { product: { select: { name: true } } } },
          payments: { orderBy: { createdAt: "desc" } },
          history: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  });
}
