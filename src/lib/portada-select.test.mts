import { test } from "node:test";
import assert from "node:assert/strict";
import { onlyRealDeals, pickDistinctByCategory } from "./portada-select.ts";

const p = (id: string, slug: string, image: string | null = "https://x/y.webp") => ({
  id,
  image,
  category: { slug },
});

test("pickDistinctByCategory toma uno por categoría, en orden, y omite productos sin imagen", () => {
  const picked = pickDistinctByCategory(
    [p("a", "x"), p("b", "x"), p("c", "y"), p("d", "z", null), p("e", "w")],
    3,
  );
  assert.deepEqual(
    picked.map((item) => item.id),
    ["a", "c", "e"],
  );
});

test("pickDistinctByCategory devuelve menos elementos si no hay suficientes categorías", () => {
  assert.equal(pickDistinctByCategory([p("a", "x"), p("b", "x")], 4).length, 1);
});

test("onlyRealDeals deja solo productos cuyo precio anterior es mayor", () => {
  const deals = onlyRealDeals([
    { basePrice: 75, compareAtPrice: 100 },
    { basePrice: 100, compareAtPrice: 100 },
    { basePrice: 10, compareAtPrice: null },
  ]);
  assert.deepEqual(deals, [{ basePrice: 75, compareAtPrice: 100 }]);
});
