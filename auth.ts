/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { TSchemaResetPassword, schemaResetPassword } from "./app/(public)/reset-password/schema";
import { schemaSignIn, TSchemaSignIn } from './lib/shemas';
import { prisma } from './lib/prisma';
import { Prisma } from "./lib/generated/prisma";

// ------------------------------
// CONFIGURACIÓN DE JWT
// ------------------------------
const key = new TextEncoder().encode(process.env.AUTH_SECRET!);

export interface UsuarioSesion extends JWTPayload {
  IdUser: string;
  Usuario: string;
  Nombre?: string | null;
  FotoUrl?: string | null;
  Rol: string;
  IdRol: string;
  Permiso: string[];
  DebeCambiar: boolean;
}

// Generar token JWT
export async function encrypt(payload: UsuarioSesion) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h") // Token válido 6 horas
    .sign(key);
}

// Verificar token y obtener payload
export const decrypt = async (token: string): Promise<UsuarioSesion | null> => {
  try {
    const { payload } = await jwtVerify<JWTPayload>(token, key, { algorithms: ["HS256"] });
    return {
      IdUser: payload.IdUser as string,
      Usuario: payload.Usuario as string,
      Rol: payload.Rol as string,
      Nombre: payload.Nombre as string | null,
      FotoUrl: payload.FotoUrl as string | null,
      IdRol: payload.IdRol as string,
      Permiso: (payload.Permiso as string[]) || [],
      DebeCambiar: payload.DebeCambiar === true || payload.DebeCambiar === "True",
      iss: payload.iss as string,
      aud: payload.aud as string,
    };
  } catch (err: any) {
    console.error("Error al decodificar token:", err.name === "JWTExpired" ? "Token expirado" : err);
    return null;
  }
};

// ------------------------------
// TIPOS GENERALES
// ------------------------------
export interface LoginResult {
  success?: string;
  error?: string;
  redirect?: string;
}

type AuthDbResult = {
  token: string;
  debeCambiar: boolean;
};

// ------------------------------
// GESTIÓN DE COOKIE DE SESIÓN
// ------------------------------
const setSessionCookie = (token: string) => {
  const expires = new Date(Date.now() + 6 * 60 * 60 * 1000);
  cookies().set("session", token, {
    expires,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const getSession = async (): Promise<UsuarioSesion | null> => {
  const token = cookies().get("session")?.value;
  return token ? decrypt(token) : null;
};

export const getSessionPermisos = async (): Promise<string[] | null> => {
  const sess = await getSession();
  return sess?.Permiso || null;
};

export const signOut = async () => {
  cookies().delete("session");
};

// ------------------------------
// LOGIN / RESET PASSWORD
// ------------------------------
export const login = async (credentials: TSchemaSignIn, redirect: string): Promise<LoginResult> => {
  const parsed = schemaSignIn.safeParse(credentials);
  if (!parsed.success) return { error: "Usuario o contraseña inválidos" };

  const { usuario, contrasena } = parsed.data;
  const authResult = await authenticateDB(usuario, contrasena);
  if (!authResult) return { error: "Usuario o contraseña inválidos" };

  setSessionCookie(authResult.token);
  return { success: "Login OK", redirect: authResult.debeCambiar ? "/reset-password" : redirect };
};

export const resetPassword = async (credentials: TSchemaResetPassword, username: string): Promise<LoginResult> => {
  const parsed = schemaResetPassword.safeParse(credentials);
  if (!parsed.success) return { error: "Error al cambiar la contraseña" };

  const token = await changePassword(username, parsed.data.confirmar);
  if (!token) return { error: "Error al cambiar la contraseña" };

  setSessionCookie(token);
  return { success: "Contraseña cambiada con éxito" };
};

// ------------------------------
// AUTENTICACIÓN CON BASE DE DATOS (Prisma)
// ------------------------------
const usuarioWithRolArgs = Prisma.validator<Prisma.UsuarioDefaultArgs>()({
  include: {
    rol: { include: { permisos: { include: { permiso: true } } } },

  },
});
type UsuarioConRol = Prisma.UsuarioGetPayload<typeof usuarioWithRolArgs>;

async function authenticateDB(username: string, password: string): Promise<AuthDbResult | null> {
  try {
    const user: UsuarioConRol | null = await prisma.usuario.findFirst({
      where: { usuario: username },
      include: usuarioWithRolArgs.include,
    });
    if (!user || !(await bcrypt.compare(password, user.contrasena))) return null;

    const permisos = user.rol.permisos.map((rp: { permiso: { nombre: any; }; }) => rp.permiso.nombre);

    const payload: UsuarioSesion = {
      IdUser: user.id,
      Usuario: user.usuario,
      Rol: user.rol.nombre,
      Nombre: user.nombre,
      FotoUrl: user.fotoUrl,
      IdRol: user.rol_id,
      Permiso: permisos,
      DebeCambiar: user.DebeCambiarPassword!,
      iss: "your-issuer",
      aud: "your-audience",
    };

    return {
      token: await encrypt(payload),
      debeCambiar: payload.DebeCambiar,
    };
  } catch (err) {
    console.error("Error en authenticateDB:", err);
    return null;
  }
}

// ------------------------------
// CAMBIO DE CONTRASEÑA
// ------------------------------
async function changePassword(username: string, newPassword: string): Promise<string | null> {
  try {
    const user = await prisma.usuario.findFirst({
      where: { usuario: username },
      include: usuarioWithRolArgs.include,
    });
    if (!user) return null;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.usuario.update({
      where: { id: user.id },
      data: { contrasena: hashedPassword, DebeCambiarPassword: false },
      include: usuarioWithRolArgs.include,
    });

    const permisos = updated.rol.permisos.map((rp: { permiso: { nombre: any; }; }) => rp.permiso.nombre);
    const payload: UsuarioSesion = {
      IdUser: updated.id,
      Usuario: updated.usuario,
      Rol: updated.rol.nombre,
      Nombre: updated.nombre,
      FotoUrl: updated.fotoUrl,
      IdRol: updated.rol_id,
      Permiso: permisos,
      DebeCambiar: updated.DebeCambiarPassword!,
      iss: "your-issuer",
      aud: "your-audience",
    };

    return encrypt(payload);
  } catch (err) {
    console.error("Error en changePassword:", err);
    return null;
  }
}
