import { z } from "zod";

export const metodoEnvioSchema = z.object({
  id: z.string().optional(),
  zoneId: z.string().min(1, "Zona requerida"),
  name: z.string().min(2),
  type: z.enum(["FLAT", "WEIGHT", "PRICE"]),
  price: z.coerce.number().nonnegative(),
  active: z.boolean().default(true),
});

export type MetodoEnvioInput = z.infer<typeof metodoEnvioSchema>;
