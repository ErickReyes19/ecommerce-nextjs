import { ProductCard } from "@/src/components/ecommerce/product-card";
import { SectionHeader } from "@/src/components/ecommerce/section-header";
import type { PortadaProduct } from "@/app/(public)/portada-data";

/** Ofertas: productos con precio anterior mayor al actual, en un carril horizontal. */
export function PromoSection({ products }: { products: PortadaProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="ofertas" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:mt-24 lg:px-8">
      <SectionHeader id="ofertas" title="Ofertas" description="Precios rebajados en este momento." />

      <ul
        aria-label="Productos en oferta"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {products.map((product) => (
          <li key={product.id} className="flex w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-5rem)/5)]">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
