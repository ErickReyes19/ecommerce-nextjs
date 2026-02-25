"use server";

import { prisma } from "@/lib/prisma";
import { productSchema } from "./schema";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  await prisma.product.create({ data: parsed.data });
  revalidatePath("/productos");
  revalidatePath("/protected/productos");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/productos");
  revalidatePath("/protected/productos");
}
