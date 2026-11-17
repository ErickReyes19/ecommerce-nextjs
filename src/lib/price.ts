const hnlFormatter = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  minimumFractionDigits: 2,
});

export function splitHNL(amount: number): { symbol: string; integer: string; fraction: string } {
  let symbol = "";
  let integer = "";
  let fraction = "";

  for (const part of hnlFormatter.formatToParts(amount)) {
    if (part.type === "currency") symbol = part.value;
    else if (part.type === "integer" || part.type === "group") integer += part.value;
    else if (part.type === "fraction") fraction = part.value;
  }

  return { symbol, integer, fraction };
}

export function discountPercent(basePrice: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= basePrice) return null;
  return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
}
