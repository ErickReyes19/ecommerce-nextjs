import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addToCart } from "@/src/actions/cart-actions";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { category: true } });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Tienda`,
    description: product.shortDescription ?? product.description,
    openGraph: { title: product.name, description: product.shortDescription ?? undefined },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({ where: { slug: params.slug }, include: { variants: true, images: true, category: true } });
  if (!product) notFound();

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];

  return (
    <main className="container mx-auto grid gap-8 px-4 py-8 md:grid-cols-2">
      <Card>
        <CardContent className="p-6 space-y-3">
          {product.images.slice(0, 3).map((img) => (
            <div className="rounded-md border p-4" key={img.id}>{img.url}</div>
          ))}
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Badge>{product.category.name}</Badge>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p>{product.description}</p>
        <p className="text-2xl font-semibold">${Number(defaultVariant?.salePrice ?? defaultVariant?.price ?? product.basePrice).toFixed(2)}</p>

        <form action={async () => {
          "use server";
          if (!defaultVariant) return;
          await addToCart({ productId: product.id, variantId: defaultVariant.id, quantity: 1 });
        }}>
          <Button type="submit">Agregar al carrito</Button>
        </form>
      </div>
    </main>
  );
}
