import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Se genera en cada request para reflejar productos actuales y no depender de la BD durante el build
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } });
  const categories = await prisma.category.findMany({ select: { slug: true, updatedAt: true } });

  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/productos`, lastModified: new Date() },
    ...products.map((p) => ({ url: `${base}/productos/${p.slug}`, lastModified: p.updatedAt })),
    ...categories.map((c) => ({ url: `${base}/productos?categoria=${c.slug}`, lastModified: c.updatedAt })),
  ];
}
