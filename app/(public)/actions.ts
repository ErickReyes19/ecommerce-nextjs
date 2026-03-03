// app/actions/auth.ts

"use server";

import { prisma } from "@/lib/prisma";
import { EmailService, MailPayload } from "@/lib/sendEmail";
import { generateUserCreatedEmailHtml } from "@/lib/templates/createUserEmail";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { requestPasswordReset } from "./forgot-password/actions";

export async function forgotPasswordAction(formData: FormData) {
    const username = formData.get("username");
    if (typeof username !== "string" || !username.trim() || username.length < 3) {
        // Si el usuario está vacío, redirigimos de vuelta a login con un flag de error
        return false;
    }

    // Llamamos a la lógica que genera el token y envía el email
    await requestPasswordReset(username.trim());

    // Redirigimos al login con un mensaje de “correo enviado”
    return true
}

function buildUsernameFromEmail(email: string) {
    const localPart = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "usuario";
    return localPart.slice(0, 40);
}

export async function registerWithEmailAction(formData: FormData) {
    const email = formData.get("email");

    if (typeof email !== "string" || !email.trim()) return false;

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) return false;

    const existingUser = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return true;

    const clientRole = await prisma.rol.findUnique({ where: { nombre: "CLIENTE" } });
    if (!clientRole) {
        console.error("No existe el rol CLIENTE para auto-registro.");
        return false;
    }

    let username = buildUsernameFromEmail(normalizedEmail);
    let suffix = 1;

    while (await prisma.usuario.findFirst({ where: { usuario: username } })) {
        username = `${buildUsernameFromEmail(normalizedEmail)}${suffix}`.slice(0, 50);
        suffix += 1;
    }

    const tempPassword = randomBytes(9).toString("base64").slice(0, 12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.usuario.create({
        data: {
            id: randomUUID(),
            usuario: username,
            email: normalizedEmail,
            rol_id: clientRole.id,
            contrasena: hashedPassword,
            activo: true,
            DebeCambiarPassword: true,
        },
    });

    const html = generateUserCreatedEmailHtml(username, username, tempPassword);
    const mailPayload: MailPayload = {
        to: normalizedEmail,
        subject: "Tu cuenta fue creada: contraseña temporal",
        html,
    };

    try {
        const emailService = new EmailService();
        await emailService.sendMail(mailPayload);
        return true;
    } catch (err) {
        console.error("Error enviando correo de registro:", err);
        return false;
    }
}
