import { z } from "zod";

export const productSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(3),
    slug: z.string().min(3),
    description: z.string().min(10),
    shortDescription: z.string().max(191).optional().nullable(),
    sku: z.string().min(3),
    basePrice: z.number().positive(),
    compareAtPrice: z.number().positive().optional().nullable(),
    salePrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0),
    defaultVariantName: z.string().min(3),
    defaultVariantWeight: z.number().positive().optional().nullable(),
    active: z.boolean(),
    categoryId: z.string().min(1),
    brandId: z.string().optional().nullable(),
    imageUrls: z.string().optional(),
  })
  .refine(
    (data) => !data.compareAtPrice || data.compareAtPrice >= data.basePrice,
    {
      message: "El precio de comparación debe ser mayor o igual al precio base",
      path: ["compareAtPrice"],
    },
  )
  .refine((data) => !data.salePrice || data.salePrice <= data.basePrice, {
    message: "El precio de descuento debe ser menor o igual al precio base",
    path: ["salePrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;
