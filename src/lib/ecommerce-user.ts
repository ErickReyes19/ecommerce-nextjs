import { prisma } from "@/lib/prisma";

export async function getOrCreateEcommerceUserBySessionUserId(sessionUserId: string) {
  return prisma.usuario.findUnique({
    where: { id: sessionUserId },
  });
}
