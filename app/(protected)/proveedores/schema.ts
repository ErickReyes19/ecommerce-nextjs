import { z } from "zod";

export const providerServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nombre del servicio requerido"),
  baseUrl: z.string().url("URL base inválida"),
  productEndpoint: z.string().min(1, "Endpoint de productos requerido"),
  orderEndpoint: z.string().min(1, "Endpoint de órdenes requerido"),
  authType: z.string().min(2, "Tipo de autenticación requerido"),
  token: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  secretKey: z.string().optional().nullable(),
  headersJson: z.string().optional().nullable(),
  productMappingJson: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export const proveedorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2, "Slug requerido"),
  description: z.string().optional().nullable(),
  type: z.enum(["API", "MANUAL"]).default("API"),
  active: z.boolean().default(true),
  services: z.array(providerServiceSchema).min(1, "Debe registrar al menos un servicio"),
});

export type ProveedorInput = z.infer<typeof proveedorSchema>;
