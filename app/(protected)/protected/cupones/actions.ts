"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CuponInput, cuponSchema } from "./schema";

export async function getCupones() {
  return prisma.coupon.findMany({ orderBy: { code: "asc" } });
}

export async function getCuponById(id: string) {
  return prisma.coupon.findUnique({ where: { id } });
}

export async function createCupon(data: CuponInput) {
  const parsed = cuponSchema.parse(data);
  await prisma.coupon.create({
    data: {
      code: parsed.code,
      type: parsed.type,
      target: parsed.target,
      value: parsed.value,
      active: parsed.active,
    },
  });
  revalidatePath("/protected/cupones");
}

export async function updateCupon(data: CuponInput) {
  const parsed = cuponSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");
  await prisma.coupon.update({
    where: { id: parsed.id },
    data: {
      code: parsed.code,
      type: parsed.type,
      target: parsed.target,
      value: parsed.value,
      active: parsed.active,
    },
  });
  revalidatePath("/protected/cupones");
}

export async function deleteCupon(id: string) {
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/protected/cupones");
}
