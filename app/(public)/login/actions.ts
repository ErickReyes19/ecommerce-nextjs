"use server";

import { login } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { LoginActionState } from "./state";

export async function loginWithCredentialsAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = formData.get("identifier");
  const contrasena = formData.get("contrasena");
  const callbackUrl = formData.get("callbackUrl");

  if (typeof identifier !== "string" || typeof contrasena !== "string") {
    return { ok: false, message: "Debes ingresar usuario/correo y contraseña." };
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();
  if (!normalizedIdentifier || !contrasena.trim()) {
    return { ok: false, message: "Debes ingresar usuario/correo y contraseña." };
  }

  let usuario = normalizedIdentifier;

  if (normalizedIdentifier.includes("@")) {
    const userByEmail = await prisma.usuarios.findUnique({
      where: { email: normalizedIdentifier },
      select: { usuario: true },
    });

    if (!userByEmail) {
      return { ok: false, message: "Usuario/correo o contraseña inválidos." };
    }

    usuario = userByEmail.usuario;
  }

  const safeCallback = typeof callbackUrl === "string" && callbackUrl.startsWith("/") ? callbackUrl : "/mi-perfil";
  const result = await login({ usuario, contrasena }, safeCallback);

  if (result.error) {
    return { ok: false, message: "Usuario/correo o contraseña inválidos." };
  }

  return {
    ok: true,
    message: "Inicio de sesión exitoso.",
    redirect: result.redirect ?? safeCallback,
  };
}
