"use client";

import { useEffect, useRef } from "react";
import { syncLocalCart } from "@/src/actions/cart-actions";
import { readLocalCart, writeLocalCart } from "@/src/lib/local-cart";

export function CartHydrator() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    const localCart = readLocalCart();
    if (!localCart.items.length) return;

    syncLocalCart(localCart.items)
      .then(() => {
        writeLocalCart({
          ...localCart,
          updatedAt: new Date().toISOString(),
        });
      })
      .catch(() => {
        // noop: keep local data for a future retry
      });
  }, []);

  return null;
}
