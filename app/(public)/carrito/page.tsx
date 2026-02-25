import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { removeCartItem, updateCartItem } from "@/src/actions/cart-actions";
import { CartLocalStorageSync } from "@/src/components/ecommerce/cart-local-storage-sync";
import type { Metadata } from "next";
import { formatHNL } from "@/src/lib/currency";
import { ProductCard } from "@/src/components/ecommerce/product-card";

export const metadata: Metadata = {
  title: "Carrito | Tienda",
  description: "Revisa los productos en tu carrito de compras.",
};

export default async function CarritoPage() {
  const token = cookies().get("guest_cart")?.value;
  const cart = token
    ? await prisma.cart.findUnique({
        where: { token },
        include: {
          items: {
            include: {
              product: { include: { images: { where: { isMain: true }, take: 1 }, category: true } },
              variant: true,
            },
          },
        },
      })
    : null;

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (acc, item) =>
      acc +
      Number(
        item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice
      ) *
        item.quantity,
    0
  );


  const cartProductIds = items.map((item) => item.productId);
  const cartCategoryIds = Array.from(new Set(items.map((item) => item.product.categoryId)));

  const recommendedProducts = cartCategoryIds.length
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          categoryId: { in: cartCategoryIds },
          id: { notIn: cartProductIds.length ? cartProductIds : undefined },
        },
        include: {
          category: { select: { name: true } },
          images: { where: { isMain: true }, take: 1 },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight text-foreground">
        Tu carrito
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {items.length} articulo{items.length !== 1 ? "s" : ""} en tu carrito
      </p>

      <CartLocalStorageSync
        token={token}
        items={items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? undefined,
          quantity: item.quantity,
        }))}
      />

      {items.length > 0 ? (
        <>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => {
              const unitPrice = Number(
                item.variant?.salePrice ??
                  item.variant?.price ??
                  item.product.basePrice
              );
              const image = item.product.images[0]?.url;

              return (
                <Card key={item.id} className="overflow-hidden border-border/50">
                  <CardContent className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {item.product.category.name}
                        </p>
                        <Link
                          href={`/productos/${item.product.slug}`}
                          className="font-semibold text-foreground transition-colors hover:text-muted-foreground"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.variant.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <form
                            action={async () => {
                              "use server";
                              const nextQty = Math.max(1, item.quantity - 1);
                              await updateCartItem(item.id, nextQty);
                            }}
                          >
                            <Button type="submit" variant="outline" size="sm">-</Button>
                          </form>
                          <Badge variant="secondary">Cant: {item.quantity}</Badge>
                          <form
                            action={async () => {
                              "use server";
                              await updateCartItem(item.id, item.quantity + 1);
                            }}
                          >
                            <Button type="submit" variant="outline" size="sm">+</Button>
                          </form>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatHNL(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <form
                      action={async () => {
                        "use server";
                        await removeCartItem(item.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="h-fit border-border/50">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Resumen
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatHNL(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envio</span>
                  <span className="text-muted-foreground">
                    Calculado en checkout
                  </span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatHNL(subtotal)}</span>
              </div>
              <Button
                asChild
                size="lg"
                className="mt-6 w-full rounded-full"
              >
                <Link href="/checkout">
                  Ir a checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="mt-3 w-full rounded-full"
              >
                <Link href="/productos">Seguir comprando</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {recommendedProducts.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Recomendaciones para ti
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    basePrice: Number(product.basePrice),
                    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                    category: { name: product.category.name },
                    image: product.images[0]?.url ?? null,
                  }}
                />
              ))}
            </div>
          </section>
        ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <p className="text-lg font-semibold text-foreground">
            Tu carrito esta vacio
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Explora nuestro catalogo y agrega productos.
          </p>
          <Button asChild className="mt-6 rounded-full" size="lg">
            <Link href="/productos">
              Explorar productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}