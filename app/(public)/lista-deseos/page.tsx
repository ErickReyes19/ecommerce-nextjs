import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/src/components/ecommerce/product-card";
import { pickFirstValidImageUrl } from "@/src/lib/image-url";
import { getWishlistProducts } from "./actions";

export const dynamic = "force-dynamic";

export default async function ListaDeseosPage() {
  const session = await getSession();

  if (!session?.IdUser) {
    redirect("/login?callbackUrl=/lista-deseos");
  }

  if (!session.Permiso?.includes("ver_lista_deseos")) {
    redirect("/");
  }

  const items = await getWishlistProducts(session.IdUser);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-10 rounded-3xl border border-border/60 bg-gradient-to-r from-rose-50 via-background to-pink-50 p-6 shadow-sm dark:from-rose-950/20 dark:to-pink-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tu espacio favorito</p>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Lista de deseos</h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Aquí guardas los productos que quieres comprar luego. Puedes quitar o agregar desde cualquier card.
        </p>
        <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground">
          <Sparkles className="h-4 w-4" /> {items.length} producto{items.length !== 1 ? "s" : ""} guardado{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                basePrice: Number(item.product.basePrice),
                compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
                category: { name: item.product.category.name },
                image: pickFirstValidImageUrl(item.product.images.map((image) => image.url)),
                initialIsInWishlist: true,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Tu lista de deseos está vacía</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Explora el catálogo y marca con el corazón los productos que te interesan.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/productos">Explorar productos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
