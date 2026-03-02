"use server";

import { getSession } from "@/auth";
import { CommentStatus } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminProductComments(status?: CommentStatus) {
  return prisma.productComment.findMany({
    where: status ? { status } : undefined,
    include: {
      product: { select: { id: true, name: true, slug: true } },
      user: { select: { nombre: true, usuario: true } },
      reviewedBy: { select: { nombre: true, usuario: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function moderateProductComment(commentId: string, status: CommentStatus.APPROVED | CommentStatus.REJECTED) {
  const session = await getSession();
  if (!session?.IdUser || session.Rol !== "ADMIN") {
    throw new Error("No autorizado");
  }

  await prisma.productComment.update({
    where: { id: commentId },
    data: {
      status,
      reviewedById: session.IdUser,
      reviewedAt: new Date(),
    },
    include: { product: { select: { slug: true } } },
  }).then((comment) => {
    revalidatePath(`/productos/${comment.product.slug}`);
  });

  revalidatePath("/comentarios");
}
