"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MetodoEnvioInput, metodoEnvioSchema } from "./schema";

export async function getMetodosEnvio() {
  return prisma.shippingMethod.findMany({ include: { zone: true }, orderBy: { name: "asc" } });
}

export async function getMetodoEnvioById(id: string) {
  return prisma.shippingMethod.findUnique({ where: { id } });
}

export async function getShippingZones() {
  return prisma.shippingZone.findMany({ orderBy: { name: "asc" } });
}

export async function createMetodoEnvio(data: MetodoEnvioInput) {
  const parsed = metodoEnvioSchema.parse(data);
  await prisma.shippingMethod.create({
    data: {
      zoneId: parsed.zoneId,
      name: parsed.name,
      type: parsed.type,
      price: parsed.price,
      active: parsed.active,
    },
  });
  revalidatePath("/metodos-envio");
}

export async function updateMetodoEnvio(data: MetodoEnvioInput) {
  const parsed = metodoEnvioSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");
  await prisma.shippingMethod.update({
    where: { id: parsed.id },
    data: {
      zoneId: parsed.zoneId,
      name: parsed.name,
      type: parsed.type,
      price: parsed.price,
      active: parsed.active,
    },
  });
  revalidatePath("/metodos-envio");
}

export async function deleteMetodoEnvio(id: string) {
  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath("/metodos-envio");
}
