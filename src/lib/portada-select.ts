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

export function onlyRealDeals<T extends { basePrice: number; compareAtPrice: number | null }>(items: T[]): T[] {
  return items.filter((item) => item.compareAtPrice !== null && item.compareAtPrice > item.basePrice);
}
