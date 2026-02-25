import { z } from "zod";

export const pedidoSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().min(3),
  status: z.enum(["PENDIENTE", "PAGADO", "PROCESANDO", "ENVIADO", "CANCELADO"]),
  subtotal: z.coerce.number().nonnegative(),
  grandTotal: z.coerce.number().nonnegative(),
  notes: z.string().optional(),
});

export type PedidoInput = z.infer<typeof pedidoSchema>;
