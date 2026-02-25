import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  sku: z.string().min(3),
  basePrice: z.coerce.number().positive(),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
