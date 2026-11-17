import type { Metadata } from "next";
import { HeroSection } from "@/src/components/ecommerce/hero-section";
import { CategoriesGrid } from "@/src/components/ecommerce/categories-grid";
import { PromoSection } from "@/src/components/ecommerce/promo-section";
import { FeaturedProducts } from "@/src/components/ecommerce/featured-products";
import { FeaturesStrip } from "@/src/components/ecommerce/features-strip";
import { getPortadaData } from "./portada-data";

// La portada consulta Prisma en cada visita: nunca se prerenderiza en el build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda | Lo de la casa, el cel y el clóset",
  description:
    "Productos para la casa, tecnología, moda y más, con precios en lempiras y pago seguro con tarjeta.",
};

export default async function HomePage() {
  const data = await getPortadaData();

  return (
    <div>
      <HeroSection products={data.hero} categories={data.categories} totals={data.totals} />
      <CategoriesGrid categories={data.categories} />
      <PromoSection products={data.deals} />
      <FeaturedProducts products={data.latest} />
      <FeaturesStrip />
    </div>
  );
}
