"use server";

import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CommentStatus } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

export async function getProductMetadata(slug: string) {
  return prisma.product.findFirst({ where: { slug, active: true }, include: { category: true } });
}

export async function getProductDetail(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      variants: { orderBy: { isDefault: "desc" } },
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
      provider: true,
      providerService: true,
      attributes: { include: { attribute: true, attributeValue: true } },
    },
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: productId }, active: true },
    include: { category: true, images: { where: { isMain: true }, take: 1 } },
    take: 4,
  });
}

export async function getProductComments(productId: string, userId?: string) {
  return prisma.productComment.findMany({
    where: {
      productId,
      OR: [
        { status: CommentStatus.APPROVED },
        ...(userId ? [{ status: CommentStatus.PENDING, userId }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          nombre: true,
          usuario: true,
        },
      },
    },
  });
}

export async function createProductComment(productId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.IdUser) return { ok: false, error: "Debes iniciar sesión para comentar" };

  const content = String(formData.get("content") ?? "").trim();
  if (content.length < 3) return { ok: false, error: "El comentario debe tener al menos 3 caracteres" };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, slug: true, active: true } });
  if (!product?.active) return { ok: false, error: "Producto no disponible" };

  await prisma.productComment.create({
    data: {
      productId: product.id,
      userId: session.IdUser,
      content,
      status: CommentStatus.PENDING,
    },
  });

  revalidatePath(`/productos/${product.slug}`);
  return { ok: true };
}
