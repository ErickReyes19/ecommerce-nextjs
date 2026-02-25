import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/src/components/ecommerce/hero-section";
import { CategoriesGrid } from "@/src/components/ecommerce/categories-grid";
import { FeaturedProducts } from "@/src/components/ecommerce/featured-products";
import { PromoSection } from "@/src/components/ecommerce/promo-section";
import { FeaturesStrip } from "@/src/components/ecommerce/features-strip";

const categoryImages: Record<string, string> = {
  0: "/images/category-fashion.jpg",
  1: "/images/category-accessories.jpg",
  2: "/images/category-home.jpg",
};

export default async function LandingPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        images: { where: { isMain: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const categoriesForGrid = categories.map((cat, i) => ({
    name: cat.name,
    slug: cat.slug,
    image: categoryImages[String(i)] ?? "/images/category-home.jpg",
    productCount: cat._count.products,
  }));

  const featuredProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    category: { name: p.category.name },
    image: p.images[0]?.url ?? null,
  }));

  return (
    <>
      <HeroSection />
      <FeaturesStrip />
      <CategoriesGrid categories={categoriesForGrid} />
      <FeaturedProducts products={featuredProducts} />
      <PromoSection />
    </>
  );
}
