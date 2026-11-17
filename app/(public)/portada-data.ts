import { prisma } from "@/lib/prisma";
import { pickFirstValidImageUrl } from "@/src/lib/image-url";
import { onlyRealDeals, pickDistinctByCategory, rankCategories, withImage } from "@/src/lib/portada-select";
import { getWishlistProductIdsForCurrentUser } from "@/src/actions/wishlist-actions";

export type PortadaProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  image: string | null;
  category: { name: string; slug: string };
  initialIsInWishlist: boolean;
};

export type PortadaCategory = {
  name: string;
  slug: string;
  productCount: number;
  image: string | null;
};

export type PortadaData = {
  hero: PortadaProduct[];
  categories: PortadaCategory[];
  deals: PortadaProduct[];
  latest: PortadaProduct[];
  totals: { products: number; categories: number };
};

const EMPTY: PortadaData = {
  hero: [],
  categories: [],
  deals: [],
  latest: [],
  totals: { products: 0, categories: 0 },
};

const HERO_COUNT = 4;
const CATEGORY_COUNT = 10;
const DEALS_COUNT = 10;
const LATEST_COUNT = 8;

const productInclude = {
  category: { select: { name: true, slug: true } },
  images: { where: { isMain: true }, take: 1, select: { url: true } },
} as const;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  basePrice: unknown;
  compareAtPrice: unknown;
  category: { name: string; slug: string };
  images: { url: string }[];
};

function toPortadaProduct(row: ProductRow, wishlist: Set<string>): PortadaProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    basePrice: Number(row.basePrice),
    compareAtPrice: row.compareAtPrice === null ? null : Number(row.compareAtPrice),
    image: pickFirstValidImageUrl(row.images.map((image) => image.url)),
    category: row.category,
    initialIsInWishlist: wishlist.has(row.id),
  };
}

async function getWishlistIds(): Promise<Set<string>> {
  try {
    return new Set(await getWishlistProductIdsForCurrentUser());
  } catch {
    return new Set();
  }
}

/** Datos reales de la portada. Si la base de datos falla, devuelve listas vacías para que la página siga en pie. */
export async function getPortadaData(): Promise<PortadaData> {
  try {
    const activeProduct = { active: true };

    const [categoryRows, topRated, dealRows, latestRows, productCount, wishlist] = await Promise.all([
      prisma.category.findMany({
        where: { products: { some: activeProduct } },
        select: {
          name: true,
          slug: true,
          _count: { select: { products: { where: activeProduct } } },
          products: {
            where: activeProduct,
            orderBy: { rating: "desc" },
            take: 5,
            select: { images: { where: { isMain: true }, take: 1, select: { url: true } } },
          },
        },
      }),
      prisma.product.findMany({
        where: activeProduct,
        orderBy: { rating: "desc" },
        take: 24,
        include: productInclude,
      }),
      prisma.product.findMany({
        where: { ...activeProduct, compareAtPrice: { not: null } },
        orderBy: { rating: "desc" },
        take: 60,
        include: productInclude,
      }),
      prisma.product.findMany({
        where: activeProduct,
        orderBy: { createdAt: "desc" },
        take: 32,
        include: productInclude,
      }),
      prisma.product.count({ where: activeProduct }),
      getWishlistIds(),
    ]);

    const toProduct = (row: ProductRow) => toPortadaProduct(row, wishlist);

    const categories = rankCategories(
      categoryRows.map((category) => ({
        name: category.name,
        slug: category.slug,
        productCount: category._count.products,
        image: pickFirstValidImageUrl(category.products.flatMap((product) => product.images.map((image) => image.url))),
      })),
      CATEGORY_COUNT,
    );

    return {
      hero: pickDistinctByCategory(topRated.map(toProduct), HERO_COUNT),
      categories,
      deals: withImage(onlyRealDeals(dealRows.map(toProduct)), DEALS_COUNT),
      latest: withImage(latestRows.map(toProduct), LATEST_COUNT),
      totals: { products: productCount, categories: categoryRows.length },
    };
  } catch (error) {
    console.error("[portada] No se pudieron cargar los datos de la portada", error);
    return EMPTY;
  }
}
