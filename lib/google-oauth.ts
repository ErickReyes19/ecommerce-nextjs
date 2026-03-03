import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { SignJWT } from "jose";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const jwtKey = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export function buildGoogleAuthorizationUrl(state: string, origin: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function createSessionToken(payload: {
  IdUser: string;
  Usuario: string;
  Nombre?: string | null;
  FotoUrl?: string | null;
  Rol: string;
  IdRol: string;
  Permiso: string[];
}) {
  return new SignJWT({ ...payload, DebeCambiar: false })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("6h")
    .sign(jwtKey);
}

export async function exchangeCodeForGoogleProfile(code: string, origin: string) {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) throw new Error("No se pudo intercambiar el código con Google.");
  const tokens = await tokenRes.json();

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileRes.ok) throw new Error("No se pudo obtener perfil de Google.");
  const profile = await profileRes.json();

  return {
    email: String(profile.email ?? ""),
    name: typeof profile.name === "string" ? profile.name : "",
    picture: typeof profile.picture === "string" ? profile.picture : "",
  };
}

export async function getOrCreateGoogleSessionToken(profile: { email: string; name: string; picture: string }) {
  if (!profile.email) throw new Error("Google no devolvió email.");

  let user = await prisma.usuario.findFirst({
    where: { email: profile.email },
    include: { rol: { include: { permisos: { include: { permiso: true } } } } },
  });

  if (!user) {
    const clientRole = await prisma.rol.findFirst({ where: { OR: [{ nombre: "CLIENTE" }, { nombre: "Cliente" }] } });
    if (!clientRole) throw new Error("No existe el rol CLIENTE para crear usuarios Google.");

    user = await prisma.usuario.create({
      data: {
        id: randomUUID(),
        usuario: profile.email,
        email: profile.email,
        nombre: profile.name || null,
        fotoUrl: profile.picture || null,
        contrasena: await bcrypt.hash(randomUUID(), 10),
        rol_id: clientRole.id,
        DebeCambiarPassword: false,
        activo: true,
      },
      include: { rol: { include: { permisos: { include: { permiso: true } } } } },
    });
  }

  if ((profile.name && user.nombre !== profile.name) || (profile.picture && user.fotoUrl !== profile.picture)) {
    user = await prisma.usuario.update({
      where: { id: user.id },
      data: {
        nombre: profile.name || user.nombre,
        fotoUrl: profile.picture || user.fotoUrl,
      },
      include: { rol: { include: { permisos: { include: { permiso: true } } } } },
    });
  }

  const permisos = user.rol.permisos.map((rp) => rp.permiso.nombre);

  return createSessionToken({
    IdUser: user.id,
    Usuario: user.usuario,
    Nombre: user.nombre,
    FotoUrl: user.fotoUrl,
    Rol: user.rol.nombre,
    IdRol: user.rol_id,
    Permiso: permisos,
  });
}
