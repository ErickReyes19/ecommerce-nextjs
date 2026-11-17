// Nombres en español para las categorías que llegan del proveedor como slugs en inglés.
const CATEGORY_LABELS: Record<string, string> = {
  beauty: "Belleza",
  fragrances: "Perfumes",
  furniture: "Muebles",
  groceries: "Súper",
  "home-decoration": "Decoración",
  "kitchen-accessories": "Accesorios de cocina",
  laptops: "Laptops",
  "mens-shirts": "Camisas de hombre",
  "mens-shoes": "Zapatos de hombre",
  "mens-watches": "Relojes de hombre",
  "mobile-accessories": "Accesorios para celular",
  motorcycle: "Motos",
  "skin-care": "Cuidado de la piel",
  smartphones: "Celulares",
  "sports-accessories": "Deportes",
  sunglasses: "Lentes de sol",
  tablets: "Tablets",
  tops: "Blusas y tops",
  vehicle: "Vehículos",
  "womens-bags": "Bolsos",
  "womens-dresses": "Vestidos",
  "womens-jewellery": "Joyería",
  "womens-shoes": "Zapatos de mujer",
  "womens-watches": "Relojes de mujer",
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function getCategoryLabel(category: { name: string; slug: string }): string {
  const known = CATEGORY_LABELS[category.slug];
  if (known) return known;

  if (category.name === category.slug || SLUG_PATTERN.test(category.name)) {
    const words = category.name.replace(/-+/g, " ").trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  return category.name;
}
