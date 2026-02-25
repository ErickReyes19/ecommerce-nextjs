export function formatHNL(amount: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2,
  }).format(amount);
}
