import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const ADMIN_PERMISSIONS = [
  "ver_permisos", "ver_roles", "crear_roles", "editar_roles",
  "ver_usuarios", "crear_usuario", "editar_usuario",
  "ver_profile", 
  "ver_dashboard"
] as const;

const CLIENT_PERMISSIONS = [
  "ver_mi_perfil",
] as const;


async function upsertPermission(nombre: string) {
  return prisma.permiso.upsert({
    where: { nombre },
    update: { descripcion: `Permiso para ${nombre.replaceAll("_", " ")}`, activo: true },
    create: {
      id: randomUUID(),
      nombre,
      descripcion: `Permiso para ${nombre.replaceAll("_", " ")}`,
      activo: true,
    },
  });
}

async function assignPermissions(rolId: string, permissionNames: readonly string[]) {
  const permissions = await prisma.permiso.findMany({ where: { nombre: { in: [...permissionNames] } } });
  for (const permiso of permissions) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId, permisoId: permiso.id } },
      update: {},
      create: { rolId, permisoId: permiso.id },
    });
  }
}

async function main() {
  const resetData = process.env.RESET_SEED === "true";
  if (resetData) {
    await prisma.rolPermiso.deleteMany();
    await prisma.usuarios.deleteMany();
    await prisma.rol.deleteMany();
    await prisma.permiso.deleteMany();
  }

  await Promise.all(
    [...ADMIN_PERMISSIONS, ...CLIENT_PERMISSIONS].map((nombre) => 
      // Filter out any possible undefined values to avoid TS error
      nombre ? upsertPermission(nombre) : Promise.resolve(null)
    )
  );

  const [adminRole, clienteRole] = await Promise.all([
    prisma.rol.upsert({
      where: { nombre: "ADMIN" },
      update: { descripcion: "Rol con acceso total", activo: true },
      create: { id: randomUUID(), nombre: "ADMIN", descripcion: "Rol con acceso total", activo: true },
    }),
    prisma.rol.upsert({
      where: { nombre: "CLIENTE" },
      update: { descripcion: "Rol de cliente", activo: true },
      create: { id: randomUUID(), nombre: "CLIENTE", descripcion: "Rol de cliente", activo: true },
    }),
  ]);

  await assignPermissions(adminRole.id, [...ADMIN_PERMISSIONS, ...CLIENT_PERMISSIONS]);
  await assignPermissions(clienteRole.id, CLIENT_PERMISSIONS);

  const [adminPassword, clientePassword] = await Promise.all([
    bcrypt.hash("Admin12345*", 10),
    bcrypt.hash("Cliente12345*", 10),
  ]);
  // Admin
  await prisma.usuarios.upsert({
    where: { email: "admin@membresia.local" }, // ✅ debe coincidir con create.email
    update: {
      usuario: "admin",
      contrasena: adminPassword,
      nombre: "Administrador",
      fotoUrl: "https://i.pravatar.cc/150?img=12",
      rol_id: adminRole.id,
      activo: true,
      DebeCambiarPassword: false,
    },
    create: {
      id: randomUUID(),
      usuario: "admin",
      contrasena: adminPassword,
      nombre: "Administrador",
      fotoUrl: "https://i.pravatar.cc/150?img=12",
      email: "admin@membresia.local", // ✅ coincide con where
      rol_id: adminRole.id,
      activo: true,
      DebeCambiarPassword: false,
    },
  });

  // Cliente
  await prisma.usuarios.upsert({
    where: { email: "cliente@membresia.local" }, // ✅ coincide con create.email
    update: {
      usuario: "cliente",
      contrasena: clientePassword,
      nombre: "Cliente Demo",
      fotoUrl: "https://i.pravatar.cc/150?img=32",
      rol_id: clienteRole.id,
      activo: true,
      DebeCambiarPassword: false,
    },
    create: {
      id: randomUUID(),
      usuario: "cliente",
      contrasena: clientePassword,
      nombre: "Cliente Demo",
      fotoUrl: "https://i.pravatar.cc/150?img=32",
      email: "cliente@membresia.local", // ✅ coincide con where
      rol_id: clienteRole.id,
      activo: true,
      DebeCambiarPassword: false,
    },
  });


  console.log("Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
