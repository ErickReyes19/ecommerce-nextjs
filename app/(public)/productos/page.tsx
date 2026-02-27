import { ProductCard } from "@/src/components/ecommerce/product-card";
import { ProductFilters } from "@/src/components/ecommerce/product-filters";
import { SortSelect } from "@/src/components/ecommerce/sort-select";
import type { Prisma } from "@/lib/generated/prisma";
import type { Metadata } from "next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getProductosCatalogo } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogo | Tienda",
  description: "Explora nuestro catalogo completo de productos con filtros por categoria, marca y precio.",
};

function buildHref(searchParams: Record<string, string | string[] | undefined>, page: number) {
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (key === "page") continue;
    if (typeof rawValue === "string" && rawValue.length > 0) params.set(key, rawValue);
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        if (value.length > 0) params.append(key, value);
      }
    }
  }

  params.set("page", String(page));
  return `/productos?${params.toString()}`;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const categorySlug = typeof searchParams.categoria === "string" ? searchParams.categoria : undefined;
  const brandSlug = typeof searchParams.marca === "string" ? searchParams.marca : undefined;
  const min = searchParams.min ? Number(searchParams.min) : undefined;
  const max = searchParams.max ? Number(searchParams.max) : undefined;
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const sort = typeof searchParams.orden === "string" ? searchParams.orden : "reciente";
  const page = Math.max(1, Number(typeof searchParams.page === "string" ? searchParams.page : "1") || 1);
  const pageSize = 24;

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(brandSlug && { brand: { slug: brandSlug } }),
    ...(query && { OR: [{ name: { contains: query } }, { description: { contains: query } }] }),
    ...((min || max) && { basePrice: { ...(min && { gte: min }), ...(max && { lte: max }) } }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "precio-asc" ? { basePrice: "asc" } : sort === "precio-desc" ? { basePrice: "desc" } : sort === "nombre" ? { name: "asc" } : { createdAt: "desc" };

  const { categories, brands, products, totalCount } = await getProductosCatalogo(where, orderBy, page, pageSize);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const categoryOptions = categories.map((c) => ({ slug: c.slug, name: c.name, count: c._count.products }));
  const brandOptions = brands.filter((b) => b._count.products > 0).map((b) => ({ slug: b.slug, name: b.name, count: b._count.products }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {categorySlug ? categories.find((c) => c.slug === categorySlug)?.name ?? "Catalogo" : "Catalogo"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{totalCount} producto{totalCount !== 1 ? "s" : ""} encontrado{totalCount !== 1 ? "s" : ""}</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
        <ProductFilters categories={categoryOptions} brands={brandOptions} />
        <SortSelect current={sort} />
      </div>

      <div className="flex gap-10">
        <div className="hidden lg:block">
          <ProductFilters categories={categoryOptions} brands={brandOptions} />
        </div>

        <div className="flex-1">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted-foreground">Mostrando {products.length} de {totalCount}</p>
            <SortSelect current={sort} />
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      basePrice: Number(product.basePrice),
                      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                      image: product.images[0]?.url ?? null,
                    }}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      {page > 1 ? <PaginationPrevious href={buildHref(searchParams, page - 1)} /> : <PaginationPrevious href="#" className="pointer-events-none opacity-50" />}
                    </PaginationItem>
                    {page > 2 ? <PaginationItem><PaginationEllipsis /></PaginationItem> : null}
                    {page > 1 ? (
                      <PaginationItem>
                        <PaginationLink href={buildHref(searchParams, page - 1)}>{page - 1}</PaginationLink>
                      </PaginationItem>
                    ) : null}
                    <PaginationItem>
                      <PaginationLink href={buildHref(searchParams, page)} isActive>{page}</PaginationLink>
                    </PaginationItem>
                    {page < totalPages ? (
                      <PaginationItem>
                        <PaginationLink href={buildHref(searchParams, page + 1)}>{page + 1}</PaginationLink>
                      </PaginationItem>
                    ) : null}
                    {page < totalPages - 1 ? <PaginationItem><PaginationEllipsis /></PaginationItem> : null}
                    <PaginationItem>
                      {page < totalPages ? <PaginationNext href={buildHref(searchParams, page + 1)} /> : <PaginationNext href="#" className="pointer-events-none opacity-50" />}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold text-foreground">No se encontraron productos</p>
              <p className="mt-2 text-sm text-muted-foreground">Intenta con otros filtros o explora todas las categorias.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
