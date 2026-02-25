import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    compareAtPrice?: number | null;
    category: { name: string };
    image?: string | null;
  };
};

export function ProductCard({ product }: Props) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? Math.round(
          ((product.compareAtPrice - product.basePrice) /
            product.compareAtPrice) *
            100
        )
      : null;

  return (
    <Card className="group overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
      <Link href={`/productos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {discount && (
            <Badge className="absolute left-3 top-3" variant="destructive">
              {`-${discount}%`}
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category.name}
        </p>
        <h3 className="mb-3 line-clamp-1 text-sm font-semibold text-foreground">
          <Link
            href={`/productos/${product.slug}`}
            className="transition-colors hover:text-muted-foreground"
          >
            {product.name}
          </Link>
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              ${product.basePrice.toFixed(2)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            ) : null}
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
          >
            <Link href={`/productos/${product.slug}`}>
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Ver {product.name}</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
