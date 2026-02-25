import { z } from "zod";

export const categoriaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;
