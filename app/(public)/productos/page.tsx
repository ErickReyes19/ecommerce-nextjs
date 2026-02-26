import { ProductCard } from "@/src/components/ecommerce/product-card";
import { ProductFilters } from "@/src/components/ecommerce/product-filters";
import { SortSelect } from "@/src/components/ecommerce/sort-select";
import type { Prisma } from "@/lib/generated/prisma";
import type { Metadata } from "next";
import { getProductosCatalogo } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogo | Tienda",
  description: "Explora nuestro catalogo completo de productos con filtros por categoria, marca y precio.",
};

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

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(brandSlug && { brand: { slug: brandSlug } }),
    ...(query && { OR: [{ name: { contains: query } }, { description: { contains: query } }] }),
    ...((min || max) && { basePrice: { ...(min && { gte: min }), ...(max && { lte: max }) } }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "precio-asc" ? { basePrice: "asc" } : sort === "precio-desc" ? { basePrice: "desc" } : sort === "nombre" ? { name: "asc" } : { createdAt: "desc" };

  const { categories, brands, products, totalCount } = await getProductosCatalogo(where, orderBy);

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
