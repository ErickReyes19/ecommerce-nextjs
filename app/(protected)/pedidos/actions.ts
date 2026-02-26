"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PedidoInput, pedidoSchema } from "./schema";

export type PedidoListItem = {
  id: string;
  orderNumber: string;
  status: PedidoInput["status"];
  subtotal: number;
  grandTotal: number;
  createdAt: Date;
  userName: string;
};

export async function getPedidos() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return orders.map((order): PedidoListItem => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    grandTotal: Number(order.grandTotal),
    createdAt: order.createdAt,
    userName: order.user?.name ?? order.user?.email ?? "Cliente no identificado",
  }));
}

export async function getPedidoById(id: string) {
  return prisma.order.findUnique({ where: { id } });
}

export async function getPedidoDetalleById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      coupon: {
        select: {
          code: true,
          type: true,
          value: true,
        },
      },
      address: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function createPedido(data: PedidoInput) {
  const parsed = pedidoSchema.parse(data);
  await prisma.order.create({
    data: {
      orderNumber: parsed.orderNumber,
      status: parsed.status,
      subtotal: parsed.subtotal,
      grandTotal: parsed.grandTotal,
      notes: parsed.notes,
    },
  });
  revalidatePath("/pedidos");
}

export async function updatePedido(data: PedidoInput) {
  const parsed = pedidoSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");
  await prisma.order.update({
    where: { id: parsed.id },
    data: {
      orderNumber: parsed.orderNumber,
      status: parsed.status,
      subtotal: parsed.subtotal,
      grandTotal: parsed.grandTotal,
      notes: parsed.notes,
    },
  });
  revalidatePath("/pedidos");
}

export async function deletePedido(id: string) {
  await prisma.order.delete({ where: { id } });
  revalidatePath("/pedidos");
}
