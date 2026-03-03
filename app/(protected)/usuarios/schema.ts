import {  z } from "zod";

// Esquema para validación de usuario
export const UsuarioSchema = z.object({
  id: z.string().optional(),
  usuario: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().optional(),
  debeCambiarPassword: z.boolean().optional(),
  email: z.string(),
  rol: z.string().optional(),
  rol_id: z.string().uuid("Rol ID debe ser un UUID válido"),
  activo: z.boolean().optional(),
});

export type Usuario = z.infer<typeof UsuarioSchema>;