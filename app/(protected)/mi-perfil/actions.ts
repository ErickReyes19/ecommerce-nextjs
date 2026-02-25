"use server";

import { getSession, encrypt } from "@/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type MiPerfilActionState = {
  ok: boolean;
  message: string;
};

export async function updateMiPerfil(
  _prevState: MiPerfilActionState,
  formData: FormData
): Promise<MiPerfilActionState> {
  const session = await getSession();

  if (!session?.IdUser) {
    return { ok: false, message: "No autenticado." };
  }

  const direccion = String(formData.get("direccion") ?? "").trim();
  const ciudad = String(formData.get("ciudad") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  await prisma.usuarios.update({
    where: { id: session.IdUser },
    data: {
      direccion: direccion || null,
      ciudad: ciudad || null,
      telefono: telefono || null,
    },
  });

  revalidatePath("/mi-perfil");
  revalidatePath("/checkout");

  return { ok: true, message: "Perfil actualizado correctamente." };
}


export async function changeMiPerfilPassword(
  _prevState: MiPerfilActionState,
  formData: FormData
): Promise<MiPerfilActionState> {
  const session = await getSession();

  if (!session?.IdUser) {
    return { ok: false, message: "No autenticado." };
  }

  const actual = String(formData.get("actual") ?? "").trim();
  const nueva = String(formData.get("nueva") ?? "").trim();

  if (!actual || !nueva) {
    return { ok: false, message: "Debes completar la contraseña actual y la nueva." };
  }

  if (nueva.length < 8) {
    return { ok: false, message: "La nueva contraseña debe tener mínimo 8 caracteres." };
  }

  const user = await prisma.usuarios.findUnique({
    where: { id: session.IdUser },
    include: { rol: { include: { permisos: { include: { permiso: true } } } } },
  });

  if (!user) {
    return { ok: false, message: "Usuario no encontrado." };
  }

  const validActual = await bcrypt.compare(actual, user.contrasena);
  if (!validActual) {
    return { ok: false, message: "La contraseña actual es incorrecta." };
  }

  const hashedPassword = await bcrypt.hash(nueva, 10);
  const updated = await prisma.usuarios.update({
    where: { id: user.id },
    data: {
      contrasena: hashedPassword,
      DebeCambiarPassword: false,
    },
    include: { rol: { include: { permisos: { include: { permiso: true } } } } },
  });

  const permisos = updated.rol.permisos.map((rp) => rp.permiso.nombre);

  const token = await encrypt({
    IdUser: updated.id,
    User: updated.usuario,
    Rol: updated.rol.nombre,
    Nombre: updated.nombre,
    FotoUrl: updated.fotoUrl,
    IdRol: updated.rol_id,
    Permiso: permisos,
    DebeCambiar: updated.DebeCambiarPassword ?? false,
    iss: "your-issuer",
    aud: "your-audience",
  });

  cookies().set("session", token, {
    expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/mi-perfil");

  return { ok: true, message: "Contraseña actualizada correctamente." };
}
