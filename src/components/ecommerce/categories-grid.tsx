import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type CategoryItem = {
  name: string;
  slug: string;
  image: string;
  productCount: number;
};

export function CategoriesGrid({
  categories,
}: {
  categories: CategoryItem[];
}) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Categorias
          </p>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Explora por categoria
          </h2>
        </div>
        <Link
          href="/productos?vista=categorias"
          className="hidden items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground md:flex"
        >
          Ver todas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.slice(0, 3).map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/productos?categoria=${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-secondary"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <Image
                src={cat.image}
                alt={cat.name}
                width={600}
                height={450}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-foreground/60 to-transparent p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
                {cat.productCount} productos
              </p>
              <h3 className="text-xl font-bold text-primary-foreground">
                {cat.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
