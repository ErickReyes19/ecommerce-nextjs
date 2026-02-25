import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  category: { name: string };
  image: string | null;
};

export function FeaturedProducts({
  products,
}: {
  products: FeaturedProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Destacados
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Productos populares
          </h2>
        </div>
        <Link
          href="/productos"
          className="hidden items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground md:flex"
        >
          Ver todo el catalogo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <Card
            key={product.id}
            className="group overflow-hidden border-border/50 transition-shadow hover:shadow-lg"
          >
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
              {product.compareAtPrice && (
                <Badge className="absolute left-3 top-3" variant="destructive">
                  {`-${Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)}%`}
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.category.name}
              </p>
              <h3 className="mb-3 line-clamp-1 text-sm font-semibold text-foreground">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">
                    ${product.basePrice.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
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
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/productos">
            Ver todo el catalogo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
