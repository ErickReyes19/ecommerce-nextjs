import { ProductCard } from "@/src/components/ecommerce/product-card";
import { SectionHeader } from "@/src/components/ecommerce/section-header";
import type { PortadaProduct } from "@/app/(public)/portada-data";

/** Recién llegados: los productos más nuevos del catálogo. */
export function FeaturedProducts({ products }: { products: PortadaProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recien-llegados" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:mt-24 lg:px-8">
      <SectionHeader id="recien-llegados" title="Recién llegados" href="/productos" linkLabel="Ver catálogo" />

      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id} className="flex">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
