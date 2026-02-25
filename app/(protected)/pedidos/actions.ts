"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PedidoInput, pedidoSchema } from "./schema";

export async function getPedidos() {
  return prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
}

export async function getPedidoById(id: string) {
  return prisma.order.findUnique({ where: { id } });
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
