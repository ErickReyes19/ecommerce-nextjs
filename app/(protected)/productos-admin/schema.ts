import { z } from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  shortDescription: z.string().max(191).optional().nullable(),
  sku: z.string().min(3),
  basePrice: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  defaultVariantName: z.string().min(3).default("Variante Base"),
  defaultVariantWeight: z.coerce.number().positive().optional().nullable(),
  active: z.boolean().default(true),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
}).refine((data) => !data.compareAtPrice || data.compareAtPrice >= data.basePrice, {
  message: "El precio de comparación debe ser mayor o igual al precio base",
  path: ["compareAtPrice"],
}).refine((data) => !data.salePrice || data.salePrice <= data.basePrice, {
  message: "El precio de descuento debe ser menor o igual al precio base",
  path: ["salePrice"],
});

export type ProductInput = z.infer<typeof productSchema>;
