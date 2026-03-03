"use server";

import { prisma } from "@/lib/prisma";
import { EmailService, MailPayload } from "@/lib/sendEmail";
import { generateUserCreatedEmailHtml } from "@/lib/templates/createUserEmail";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { Usuario } from "./schema";

type CreateUsuarioResult = {
  usuario: Usuario;
  emailSent: boolean;
};

/**
 * Obtener todos los usuarios con rol y empleado
 */
export async function getUsuarios(): Promise<Usuario[]> {
  const records = await prisma.usuario.findMany({
    include: {
      rol: { select: { id: true, nombre: true } },
    },
  });
  return records.map((r) => ({
    id: r.id,
    usuario: r.usuario,
    email: r.email,
    rol: r.rol?.nombre ?? "",
    rol_id: r.rol_id,
    activo: r.activo,
  }));
}

/**
 * Crear un nuevo usuario y enviar correo con contraseña temporal
 */
export async function createUsuario(data: Usuario): Promise<CreateUsuarioResult> {
  // 1️⃣ Usar contraseña temporal proporcionada por el operador
  const tempPassword = data.password?.trim() || randomBytes(9).toString("base64").slice(0, 12);

  // 2️⃣ Hashear la contraseña temporal
  const hashed = await bcrypt.hash(tempPassword, 10);

  // 3️⃣ Crear el usuario en la base de datos
  const newUser = await prisma.usuario.create({
    data: {
      id: randomUUID(),
      usuario: data.usuario,
      rol_id: data.rol_id,
      email: data.email,
      contrasena: hashed,
      activo: true,
      DebeCambiarPassword: true,
    },
  });

  // 4️⃣ Obtener datos del empleado asociado


  let emailSent = false;

  if (data.email) {
    // 5️⃣ Construir payload del correo usando sólo la plantilla HTML
    const html = generateUserCreatedEmailHtml(
      `${data.usuario}`,
      data.usuario,
      tempPassword
    );

    const mailPayload: MailPayload = {
      to: data.email,
      subject: "Cuenta creada: contraseña temporal",
      html, // Sólo HTML de la plantilla, sin texto adicional
    };

    try {
      const emailService = new EmailService();
      await emailService.sendMail(mailPayload);
      emailSent = true;
    } catch (err) {
      console.error("Error enviando correo al usuario:", err);
    }
  }

  // 6️⃣ Devolver el usuario creado (sin contraseña)
  return {
    usuario: {
      id: newUser.id,
      usuario: newUser.usuario,
      rol: "",
      email: newUser.email,
      rol_id: newUser.rol_id,
      activo: newUser.activo,
    },
    emailSent,
  };
}

/**
 * Actualizar un usuario existente
 */
export async function updateUsuario(data: Usuario): Promise<Usuario> {
  const updated = await prisma.usuario.update({
    where: { id: data.id },
    data: {
      usuario: data.usuario,
      rol_id: data.rol_id,
      activo: data.activo,
      email: data.email,
    },
  });
  return {
    id: updated.id,
    usuario: updated.usuario,
    rol: "",
    rol_id: updated.rol_id,
    email: updated.email,
    activo: updated.activo,
  };
}

/**
 * Obtener usuario por ID
 */
export async function getUsuarioById(id: string): Promise<Usuario | null> {
  const r = await prisma.usuario.findUnique({
    where: { id },
    include: {
      rol: { select: { nombre: true } },
    },
  });
  if (!r) return null;
  return {
    id: r.id,
    usuario: r.usuario,
    rol: r.rol?.nombre ?? "",
    rol_id: r.rol_id,
    email: r.email,
    activo: r.activo,
  };
}

export async function getUsuariosOpciones(): Promise<Array<{ id: string; usuario: string }>> {
  const records = await prisma.usuario.findMany({
    select: { id: true, usuario: true },
    orderBy: { usuario: "asc" },
  });

  return records;
}
