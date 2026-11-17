import Link from "next/link";
import Image from "next/image";
import { SectionHeader } from "@/src/components/ecommerce/section-header";
import { getCategoryLabel } from "@/src/lib/category-labels";
import type { PortadaCategory } from "@/app/(public)/portada-data";

/** "Pasillos": las categorías con más productos, cada una con la foto de uno de sus productos. */
export function CategoriesGrid({ categories }: { categories: PortadaCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="pasillos" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:mt-24 lg:px-8">
      <SectionHeader id="pasillos" title="Pasillos" href="/productos" linkLabel="Ver catálogo" />

      <ul
        aria-label="Categorías"
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-5 md:gap-x-5 md:gap-y-8 md:overflow-visible md:px-0 md:pb-0"
      >
        {categories.map((category) => (
          <li key={category.slug} className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <Link
              href={`/productos?categoria=${category.slug}`}
              className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-vitrina">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 42vw, 20vw"
                    className="object-contain p-[14%]"
                  />
                ) : null}
              </div>
              <p className="mt-3 font-condensed text-[22px] font-bold leading-tight transition-colors group-hover:text-primary">
                {getCategoryLabel(category)}
              </p>
              <p className="text-sm text-muted-foreground">
                {category.productCount} {category.productCount === 1 ? "producto" : "productos"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
