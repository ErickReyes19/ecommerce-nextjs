import { test } from "node:test";
import assert from "node:assert/strict";
import { discountPercent, splitHNL } from "./price.ts";

test("splitHNL separa símbolo, enteros con miles y centavos", () => {
  assert.deepEqual(splitHNL(1299.5), { symbol: "L", integer: "1,299", fraction: "50" });
  assert.deepEqual(splitHNL(1), { symbol: "L", integer: "1", fraction: "00" });
  assert.deepEqual(splitHNL(15999.99), { symbol: "L", integer: "15,999", fraction: "99" });
});

test("discountPercent redondea el porcentaje cuando el precio anterior es mayor", () => {
  assert.equal(discountPercent(75, 100), 25);
});

test("discountPercent devuelve null cuando no hay rebaja real", () => {
  assert.equal(discountPercent(100, 100), null);
  assert.equal(discountPercent(100, 90), null);
  assert.equal(discountPercent(100, null), null);
  assert.equal(discountPercent(100), null);
});
