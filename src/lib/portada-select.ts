// Selección de productos para la portada: lógica pura, sin dependencias, para poder probarla con node --test.

export function pickDistinctByCategory<T extends { image: string | null; category: { slug: string } }>(
  items: T[],
  count: number,
): T[] {
  const seen = new Set<string>();
  const picked: T[] = [];

  for (const item of items) {
    if (picked.length >= count) break;
    if (!item.image || seen.has(item.category.slug)) continue;
    seen.add(item.category.slug);
    picked.push(item);
  }

  return picked;
}

/** La portada solo destaca productos con foto; los demás siguen en el catálogo. */
export function withImage<T extends { image: string | null }>(items: T[], limit: number): T[] {
  return items.filter((item) => Boolean(item.image)).slice(0, limit);
}

/** Pasillos: primero las categorías que tienen foto, y dentro de cada grupo las de más productos. */
export function rankCategories<T extends { productCount: number; image: string | null }>(items: T[], limit: number): T[] {
  return [...items]
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)) || b.productCount - a.productCount)
    .slice(0, limit);
}

export function onlyRealDeals<T extends { basePrice: number; compareAtPrice: number | null }>(items: T[]): T[] {
  return items.filter((item) => item.compareAtPrice !== null && item.compareAtPrice > item.basePrice);
}
