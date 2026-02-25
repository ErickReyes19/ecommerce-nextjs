import { z } from "zod";

export const ecommerceUsuarioSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email(),
  roleId: z.string().optional().nullable(),
});

export type EcommerceUsuarioInput = z.infer<typeof ecommerceUsuarioSchema>;
