import { prisma } from "@/lib/prisma";

export async function getOrCreateEcommerceUserBySessionUserId(sessionUserId: string) {
  const legacyUser = await prisma.usuarios.findUnique({
    where: { id: sessionUserId },
    select: { email: true, nombre: true },
  });

  if (!legacyUser?.email) {
    return null;
  }

  return prisma.user.upsert({
    where: { email: legacyUser.email },
    update: { name: legacyUser.nombre ?? undefined },
    create: {
      email: legacyUser.email,
      name: legacyUser.nombre,
    },
  });
}
