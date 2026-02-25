import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  sku: z.string().min(3),
  basePrice: z.coerce.number().positive(),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
});

export const cartUpdateSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1),
  shippingMethodId: z.string().min(1),
  paymentMethod: z.enum(["stripe", "paypal"]),
  couponCode: z.string().optional(),
});
