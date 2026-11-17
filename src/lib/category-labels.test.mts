import { test } from "node:test";
import assert from "node:assert/strict";
import { getCategoryLabel } from "./category-labels.ts";

test("traduce slugs conocidos del proveedor al español", () => {
  assert.equal(getCategoryLabel({ name: "smartphones", slug: "smartphones" }), "Celulares");
  assert.equal(getCategoryLabel({ name: "groceries", slug: "groceries" }), "Súper");
  assert.equal(
    getCategoryLabel({ name: "kitchen-accessories", slug: "kitchen-accessories" }),
    "Accesorios de cocina",
  );
});

test("respeta nombres que ya escribió una persona", () => {
  assert.equal(getCategoryLabel({ name: "Electrónica", slug: "electronica" }), "Electrónica");
  assert.equal(getCategoryLabel({ name: "Ropa Niños", slug: "ropa-ninos" }), "Ropa Niños");
});

test("convierte slugs desconocidos en texto legible", () => {
  assert.equal(getCategoryLabel({ name: "pet-supplies", slug: "pet-supplies" }), "Pet supplies");
});
