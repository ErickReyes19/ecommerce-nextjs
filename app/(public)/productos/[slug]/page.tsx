import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/src/components/ecommerce/product-card";
import { AddToCartButton } from "@/src/components/ecommerce/add-to-cart-button";
import { ProductImageGallery } from "@/src/components/ecommerce/product-image-gallery";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Tienda`,
    description: product.shortDescription ?? product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      variants: { orderBy: { isDefault: "desc" } },
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      brand: true,
      attributes: { include: { attribute: true, attributeValue: true } },
    },
  });

  if (!product) notFound();

  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const price = Number(
    defaultVariant?.salePrice ?? defaultVariant?.price ?? product.basePrice
  );
  const comparePrice = Number(
    defaultVariant?.price ?? product.compareAtPrice ?? 0
  );
  const hasDiscount =
    defaultVariant?.salePrice && Number(defaultVariant.salePrice) < Number(defaultVariant.price);

  const images = product.images.map((img) => ({
    id: img.id,
    url: img.url,
    alt: img.alt ?? product.name,
    isMain: img.isMain,
  }));

  // Related products
  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      active: true,
    },
    include: { category: true, images: { where: { isMain: true }, take: 1 } },
    take: 4,
  });

  // Group attributes
  const attributeGroups = product.attributes.reduce(
    (acc, attr) => {
      const name = attr.attribute.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(attr.attributeValue.value);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href="/productos"
          className="transition-colors hover:text-foreground"
        >
          Productos
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/productos?categoria=${product.category.slug}`}
          className="transition-colors hover:text-foreground"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      {/* Product layout */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <ProductImageGallery images={images} />

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">{product.category.name}</Badge>
              {product.brand && (
                <Badge variant="secondary">{product.brand.name}</Badge>
              )}
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">
              ${price.toFixed(2)}
            </span>
            {hasDiscount && comparePrice > price && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  ${comparePrice.toFixed(2)}
                </span>
                <Badge variant="destructive">
                  {`-${Math.round(((comparePrice - price) / comparePrice) * 100)}%`}
                </Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Descripcion
            </h3>
            <p className="leading-relaxed text-foreground/80">
              {product.description}
            </p>
          </div>

          {/* Attributes */}
          {Object.keys(attributeGroups).length > 0 && (
            <div className="space-y-3">
              {Object.entries(attributeGroups).map(([name, values]) => (
                <div key={name}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => (
                      <Badge key={val} variant="outline" className="px-3 py-1">
                        {val}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Variants */}
          {product.variants.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Variantes
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Badge
                    key={variant.id}
                    variant={variant.isDefault ? "default" : "outline"}
                    className="px-3 py-1"
                  >
                    {variant.name}
                    {variant.stock > 0 ? "" : " (Agotado)"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stock info */}
          {defaultVariant && (
            <p className="text-sm text-muted-foreground">
              {defaultVariant.stock > 0
                ? `${defaultVariant.stock} unidades disponibles`
                : "Producto agotado"}
            </p>
          )}

          <Separator />

          {/* Add to cart */}
          <AddToCartButton
            productId={product.id}
            variantId={defaultVariant?.id}
            disabled={!defaultVariant || defaultVariant.stock <= 0}
          />

          {/* SKU */}
          <p className="text-xs text-muted-foreground">
            SKU: {product.sku}
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-serif text-2xl font-bold tracking-tight text-foreground">
            Productos relacionados
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  basePrice: Number(p.basePrice),
                  compareAtPrice: p.compareAtPrice
                    ? Number(p.compareAtPrice)
                    : null,
                  category: { name: p.category.name },
                  image: p.images[0]?.url ?? null,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
