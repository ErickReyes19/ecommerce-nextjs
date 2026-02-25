"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EcommerceUsuarioInput, ecommerceUsuarioSchema } from "./schema";

export async function getEcommerceUsuarios() {
  return prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function getEcommerceUsuarioById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createEcommerceUsuario(data: EcommerceUsuarioInput) {
  const parsed = ecommerceUsuarioSchema.parse(data);
  await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      roleId: parsed.roleId || null,
    },
  });
  revalidatePath("/protected/usuarios");
}

export async function updateEcommerceUsuario(data: EcommerceUsuarioInput) {
  const parsed = ecommerceUsuarioSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");
  await prisma.user.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      email: parsed.email,
      roleId: parsed.roleId || null,
    },
  });
  revalidatePath("/protected/usuarios");
}

export async function deleteEcommerceUsuario(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/protected/usuarios");
}
