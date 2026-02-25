export const LOCAL_CART_KEY = "tienda_cart";

export type LocalCartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type LocalCart = {
  token?: string;
  updatedAt: string;
  items: LocalCartItem[];
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function readLocalCart(): LocalCart {
  if (!isBrowser()) {
    return { items: [], updatedAt: new Date(0).toISOString() };
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) {
      return { items: [], updatedAt: new Date(0).toISOString() };
    }

    const parsed = JSON.parse(raw) as LocalCart;
    if (!Array.isArray(parsed.items)) {
      return { items: [], updatedAt: new Date(0).toISOString() };
    }

    return {
      token: parsed.token,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      items: parsed.items,
    };
  } catch {
    return { items: [], updatedAt: new Date(0).toISOString() };
  }
}

export function writeLocalCart(cart: LocalCart) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

export function upsertLocalCartItem(item: LocalCartItem, token?: string) {
  const current = readLocalCart();
  const existingIndex = current.items.findIndex(
    (entry) =>
      entry.productId === item.productId && (entry.variantId ?? "") === (item.variantId ?? "")
  );

  const items = [...current.items];
  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + item.quantity,
    };
  } else {
    items.push(item);
  }

  writeLocalCart({
    token: token ?? current.token,
    items,
    updatedAt: new Date().toISOString(),
  });
}
