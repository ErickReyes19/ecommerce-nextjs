import { z } from "zod";

export const cuponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  target: z.enum(["GLOBAL", "PRODUCT", "CATEGORY"]).default("GLOBAL"),
  value: z.coerce.number().positive(),
  active: z.boolean().default(true),
});

export type CuponInput = z.infer<typeof cuponSchema>;
