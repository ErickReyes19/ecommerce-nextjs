import { prisma } from "@/lib/prisma";

export async function getMiPerfil(usuarioId: string) {
  return prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      usuario: true,
      nombre: true,
      fotoUrl: true,
      email: true,
      direccion: true,
      ciudad: true,
      telefono: true,
      rol: { select: { nombre: true } },
    },
  });
}

