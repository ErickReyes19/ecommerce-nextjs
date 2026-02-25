import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/src/components/ecommerce/product-card";

export const dynamic = "force-dynamic";

export default async function ProductosPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const min = Number(searchParams.min ?? 0);
  const max = Number(searchParams.max ?? 100000);
  const category = typeof searchParams.categoria === "string" ? searchParams.categoria : undefined;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { category: category ? { slug: category } : undefined, basePrice: { gte: min, lte: max }, active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Catálogo</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Input name="min" placeholder="Precio mínimo" defaultValue={min} />
        <Input name="max" placeholder="Precio máximo" defaultValue={max} />
        <Select name="categoria" defaultValue={category}>
          <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={{ ...product, basePrice: Number(product.basePrice), compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null }} />)}
      </section>
    </main>
  );
}
