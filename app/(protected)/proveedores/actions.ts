"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProveedorInput, proveedorSchema } from "./schema";

export async function getProveedores() {
  return prisma.provider.findMany({
    include: { services: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProveedorById(id: string) {
  return prisma.provider.findUnique({
    where: { id },
    include: { services: true },
  });
}

export async function getProveedoresSelector() {
  return prisma.provider.findMany({
    where: { active: true },
    select: { id: true, name: true, services: { where: { active: true }, select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createProveedor(data: ProveedorInput) {
  const parsed = proveedorSchema.parse(data);

  await prisma.provider.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      type: parsed.type,
      active: parsed.active,
      services: {
        create: parsed.services.map((service) => ({
          name: service.name,
          baseUrl: service.baseUrl,
          productEndpoint: service.productEndpoint,
          orderEndpoint: service.orderEndpoint,
          authType: service.authType,
          token: service.token || null,
          apiKey: service.apiKey || null,
          secretKey: service.secretKey || null,
          headersJson: service.headersJson || null,
          active: service.active,
        })),
      },
    },
  });

  revalidatePath("/proveedores");
}

export async function updateProveedor(data: ProveedorInput) {
  const parsed = proveedorSchema.parse(data);
  if (!parsed.id) throw new Error("ID requerido");

  await prisma.provider.update({
    where: { id: parsed.id },
    data: {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description || null,
      type: parsed.type,
      active: parsed.active,
      services: {
        deleteMany: {},
        create: parsed.services.map((service) => ({
          name: service.name,
          baseUrl: service.baseUrl,
          productEndpoint: service.productEndpoint,
          orderEndpoint: service.orderEndpoint,
          authType: service.authType,
          token: service.token || null,
          apiKey: service.apiKey || null,
          secretKey: service.secretKey || null,
          headersJson: service.headersJson || null,
          active: service.active,
        })),
      },
    },
  });

  revalidatePath("/proveedores");
}

export async function deleteProveedor(id: string) {
  await prisma.provider.delete({ where: { id } });
  revalidatePath("/proveedores");
}
