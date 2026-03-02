export const LOCAL_WISHLIST_KEY = "tienda_wishlist";

export type LocalWishlist = {
  productIds: string[];
  updatedAt: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function readLocalWishlist(): LocalWishlist {
  if (!isBrowser()) {
    return { productIds: [], updatedAt: new Date(0).toISOString() };
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_WISHLIST_KEY);
    if (!raw) return { productIds: [], updatedAt: new Date(0).toISOString() };

    const parsed = JSON.parse(raw) as LocalWishlist;
    if (!Array.isArray(parsed.productIds)) {
      return { productIds: [], updatedAt: new Date(0).toISOString() };
    }

    return {
      productIds: parsed.productIds.filter((id) => typeof id === "string" && id.length > 0),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return { productIds: [], updatedAt: new Date(0).toISOString() };
  }
}

export function writeLocalWishlist(wishlist: LocalWishlist) {
  if (!isBrowser()) return;
  window.localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
}

export function upsertLocalWishlistProduct(productId: string) {
  const current = readLocalWishlist();
  if (current.productIds.includes(productId)) return;

  writeLocalWishlist({
    productIds: [...current.productIds, productId],
    updatedAt: new Date().toISOString(),
  });
}

export function removeLocalWishlistProduct(productId: string) {
  const current = readLocalWishlist();
  if (!current.productIds.includes(productId)) return;

  writeLocalWishlist({
    productIds: current.productIds.filter((id) => id !== productId),
    updatedAt: new Date().toISOString(),
  });
}
