import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { WishlistButton } from "@/src/components/ecommerce/wishlist-button";
import { PriceTag } from "@/src/components/ecommerce/price-tag";
import { formatHNL } from "@/src/lib/currency";
import { discountPercent } from "@/src/lib/price";
import { getCategoryLabel } from "@/src/lib/category-labels";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    compareAtPrice?: number | null;
    category: { name: string; slug?: string };
    image?: string | null;
    initialIsInWishlist?: boolean;
  };
  /** Prioriza la carga de la imagen (solo para tarjetas visibles al cargar). */
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: Props) {
  const href = `/productos/${product.slug}`;
  const discount = discountPercent(product.basePrice, product.compareAtPrice);
  const categoryLabel = getCategoryLabel({
    name: product.category.name,
    slug: product.category.slug ?? product.category.name,
  });

  return (
    <article className="group relative flex w-full flex-col rounded-lg ring-offset-background has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-vitrina">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-[10%]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag aria-hidden="true" className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        {discount !== null ? (
          <span className="absolute left-2 top-2 rounded-sm bg-guara px-1.5 py-0.5 text-xs font-bold tabular-nums text-guara-foreground">
            −{discount} %
          </span>
        ) : null}
      </div>

      <WishlistButton
        productId={product.id}
        initialIsInWishlist={Boolean(product.initialIsInWishlist)}
        className="absolute right-2 top-2 z-10 h-9 w-9 bg-background/85 backdrop-blur hover:bg-background"
      />

      <div className="flex flex-1 flex-col gap-1 px-0.5 pb-1 pt-3">
        <p className="truncate text-[13px] text-muted-foreground">{categoryLabel}</p>
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug">
          <Link
            href={href}
            className="outline-none transition-colors after:absolute after:inset-0 after:rounded-lg group-hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2">
          <PriceTag amount={product.basePrice} size="sm" />
          {discount !== null && product.compareAtPrice ? (
            <del className="text-xs text-muted-foreground">
              <span className="sr-only">Precio anterior: </span>
              {formatHNL(product.compareAtPrice)}
            </del>
          ) : null}
        </div>
      </div>
    </article>
  );
}
