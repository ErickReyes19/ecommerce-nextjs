import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/src/components/ecommerce/product-card";
import { AddToCartButton } from "@/src/components/ecommerce/add-to-cart-button";
import { ProductImageGallery } from "@/src/components/ecommerce/product-image-gallery";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Star, Heart } from "lucide-react";
import { formatHNL } from "@/src/lib/currency";
import { getProductComments, getProductDetail, getProductMetadata, getRelatedProducts } from "./actions";
import { isValidImageUrl, pickFirstValidImageUrl } from "@/src/lib/image-url";
import { getWishlistProductIdsForCurrentUser } from "@/src/actions/wishlist-actions";
import { WishlistButton } from "@/src/components/ecommerce/wishlist-button";
import { ProductCommentsSection } from "@/src/components/ecommerce/product-comments";
import { getSession } from "@/auth";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductMetadata(params.slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Tienda`,
    description: product.shortDescription ?? product.description,
    openGraph: { title: product.name, description: product.shortDescription ?? undefined },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductDetail(params.slug);
  if (!product) notFound();

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const price = Number(defaultVariant?.salePrice ?? defaultVariant?.price ?? product.basePrice);
  const comparePrice = Number(defaultVariant?.price ?? product.compareAtPrice ?? 0);
  const hasDiscount = defaultVariant?.salePrice && Number(defaultVariant.salePrice) < Number(defaultVariant.price);

  const images = product.images
    .filter((img) => isValidImageUrl(img.url))
    .map((img) => ({ id: img.id, url: img.url, alt: img.alt ?? product.name, isMain: img.isMain }));
  const session = await getSession();
  const [related, wishlistProductIds, comments] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getWishlistProductIdsForCurrentUser(),
    getProductComments(product.id, session?.IdUser),
  ]);
  const wishlistSet = new Set(wishlistProductIds);

  const attributeGroups = product.attributes.reduce(
    (acc, attr) => {
      const name = attr.attribute.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(attr.attributeValue.value);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">Inicio</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/productos" className="transition-colors hover:text-foreground">Productos</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/productos?categoria=${product.category.slug}`} className="transition-colors hover:text-foreground">{product.category.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImageGallery images={images} />

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">{product.category.name}</Badge>
              {product.brand && <Badge variant="secondary">{product.brand.name}</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">{product.name}</h1>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {product.provider && <p>Proveedor: {product.provider.name}</p>}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const filled = index < Math.round(Number(product.rating ?? 0));
                    return (
                      <Star
                        key={`star-${index}`}
                        className={`h-4 w-4 ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
                      />
                    );
                  })}
                </div>
                <span>{Number(product.rating ?? 0).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{formatHNL(price)}</span>
            {hasDiscount && comparePrice > price && (
              <>
                <span className="text-xl text-muted-foreground line-through">{formatHNL(comparePrice)}</span>
                <Badge variant="destructive">{`-${Math.round(((comparePrice - price) / comparePrice) * 100)}%`}</Badge>
              </>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Descripcion</h3>
            <p className="leading-relaxed text-foreground/80">{product.description}</p>
          </div>

          {Object.keys(attributeGroups).length > 0 && (
            <div className="space-y-3">
              {Object.entries(attributeGroups).map(([name, values]) => (
                <div key={name}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => <Badge key={val} variant="outline" className="px-3 py-1">{val}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.variants.length > 1 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Variantes</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Badge key={variant.id} variant={variant.isDefault ? "default" : "outline"} className="px-3 py-1">
                    {variant.name}
                    {variant.stock > 0 ? "" : " (Agotado)"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {defaultVariant && <p className="text-sm text-muted-foreground">{defaultVariant.stock > 0 ? `${defaultVariant.stock} unidades disponibles` : "Producto agotado"}</p>}

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <AddToCartButton productId={product.id} variantId={defaultVariant?.id} disabled={!defaultVariant || defaultVariant.stock <= 0} />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-border px-3 py-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <span className="text-sm text-muted-foreground">Deseos</span>
              <WishlistButton
                productId={product.id}
                initialIsInWishlist={wishlistSet.has(product.id)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
        </div>
      </div>



      <ProductCommentsSection
        productId={product.id}
        comments={comments}
        canComment={Boolean(session?.IdUser)}
        currentUserId={session?.IdUser}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-8 font-serif text-2xl font-bold tracking-tight text-foreground">Productos relacionados</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{ id: p.id, name: p.name, slug: p.slug, basePrice: Number(p.basePrice), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, category: { name: p.category.name }, image: pickFirstValidImageUrl(p.images.map((image) => image.url)), initialIsInWishlist: wishlistSet.has(p.id) }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
