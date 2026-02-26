"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CategoriaInput, categoriaSchema } from "./schema";

export async function getCategorias() {
  return prisma.category.findMany({ include: { parent: true }, orderBy: { createdAt: "desc" } });
}

export async function getCategoriaById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function getCategoriasSelector() {
  return prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function createCategoria(data: CategoriaInput) {
  const parsed = categoriaSchema.parse(data);
  await prisma.category.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      parentId: parsed.parentId || null,
    },
  });
  revalidatePath("/categorias");
}

export async function updateCategoria(data: CategoriaInput) {
  const parsed = categoriaSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");
  await prisma.category.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      parentId: parsed.parentId || null,
    },
  });
  revalidatePath("/categorias");
}

export async function deleteCategoria(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/categorias");
}
