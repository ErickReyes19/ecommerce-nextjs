"use server";

import { prisma } from "@/lib/prisma";
import { EmailService, MailPayload } from "@/lib/sendEmail";
import { generatePasswordResetEmailHtml } from "@/lib/templates/forgoutPassword";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { addHours, isAfter } from "date-fns";

const RESET_TOKEN_TTL_HOURS = 2;

export async function isResetTokenValid(token: string): Promise<boolean> {
  if (!token) return false;

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  return !!record && !isAfter(new Date(), record.expiresAt);
}

export async function requestPasswordReset(username: string): Promise<boolean> {
  const user = await prisma.usuario.findFirst({ where: { usuario: username } });
  if (!user || !user.email) return false;

  const token = randomUUID() + randomBytes(16).toString("hex");
  const expiresAt = addHours(new Date(), RESET_TOKEN_TTL_HOURS);

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: {
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/forgot-password?token=${encodeURIComponent(token)}`;

  const html = generatePasswordResetEmailHtml(user.usuario, link);
  const mailPayload: MailPayload = {
    to: user.email,
    subject: "Restablecer contraseña",
    html,
  };

  try {
    const emailService = new EmailService();
    await emailService.sendMail(mailPayload);
    return true;
  } catch (err) {
    console.error("Error enviando correo de restablecimiento:", err);
    return false;
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { Usuario: true },
  });
  if (!record) return false;

  if (isAfter(new Date(), record.expiresAt)) {
    await prisma.passwordResetToken.delete({ where: { id: record.id } });
    return false;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.usuario.update({
    where: { id: record.userId },
    data: { contrasena: hashed, DebeCambiarPassword: false },
  });

  await prisma.passwordResetToken.delete({ where: { id: record.id } });
  return true;
}
