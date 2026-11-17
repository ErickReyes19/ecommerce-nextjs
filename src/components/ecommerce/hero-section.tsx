import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/src/components/ecommerce/price-tag";
import { HangingTag } from "@/src/components/ecommerce/hanging-tag";
import { getCategoryLabel } from "@/src/lib/category-labels";
import type { PortadaCategory, PortadaData, PortadaProduct } from "@/app/(public)/portada-data";

const CHIP_COUNT = 6;

export function HeroSection({
  products,
  categories,
  totals,
}: {
  products: PortadaProduct[];
  categories: PortadaCategory[];
  totals: PortadaData["totals"];
}) {
  const payment = "Pagas en lempiras con tarjeta, de forma segura.";
  const subtitle =
    totals.products > 0
      ? `${totals.products} productos en ${totals.categories} categorías. ${payment}`
      : payment;

  return (
    <section aria-labelledby="portada-titulo" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
      <div className={products.length > 0 ? "grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16" : ""}>
        <div className="min-w-0">
          <h1
            id="portada-titulo"
            className="max-w-[14ch] text-balance font-condensed text-[46px] font-extrabold leading-[0.95] tracking-[-0.01em] sm:text-[64px] lg:text-[80px]"
          >
            Lo de la casa, el cel y el clóset, con el precio a la vista.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">{subtitle}</p>

          <form action="/productos" role="search" className="mt-8 flex max-w-xl gap-2">
            <label htmlFor="portada-busqueda" className="sr-only">
              Buscar productos
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="portada-busqueda"
                name="q"
                type="search"
                placeholder="Buscar productos o marcas"
                className="h-[52px] w-full rounded-md border border-input bg-card pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />
            </div>
            <Button type="submit" size="lg" className="h-[52px] shrink-0 px-6 text-base font-semibold">
              Buscar
            </Button>
          </form>

          {categories.length > 0 ? (
            <nav aria-label="Categorías populares" className="-mx-4 mt-5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <ul className="flex gap-2 sm:flex-wrap">
                {categories.slice(0, CHIP_COUNT).map((category) => (
                  <li key={category.slug} className="shrink-0">
                    <Link
                      href={`/productos?categoria=${category.slug}`}
                      className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {getCategoryLabel(category)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        {products.length > 0 ? (
          <ul aria-label="Productos destacados" className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5">
            {products.map((product, index) => (
              <li key={product.id} className="min-w-0">
                <Link
                  href={`/productos/${product.slug}`}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-vitrina">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-[12%]"
                      />
                    ) : null}
                  </div>
                  <div className="-mt-5 pl-2">
                    <HangingTag index={index}>
                      <PriceTag amount={product.basePrice} size="md" className="sm:text-[30px]" />
                    </HangingTag>
                  </div>
                  <p className="mt-2 line-clamp-1 px-0.5 text-[13px] text-muted-foreground transition-colors group-hover:text-foreground">
                    {product.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
