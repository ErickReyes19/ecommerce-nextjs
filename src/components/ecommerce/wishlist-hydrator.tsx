"use client";

import { useEffect, useRef } from "react";
import { readLocalWishlist, writeLocalWishlist } from "@/src/lib/local-wishlist";
import { syncLocalWishlist } from "@/src/actions/wishlist-actions";

export function WishlistHydrator({ enabled }: { enabled: boolean }) {
  const synced = useRef(false);

  useEffect(() => {
    if (!enabled || synced.current) return;
    synced.current = true;

    const localWishlist = readLocalWishlist();
    if (!localWishlist.productIds.length) return;

    syncLocalWishlist(localWishlist.productIds)
      .then((result) => {
        if (!result?.ok) return;
        writeLocalWishlist({
          ...localWishlist,
          updatedAt: new Date().toISOString(),
        });
      })
      .catch(() => {
        // noop
      });
  }, [enabled]);

  return null;
}
