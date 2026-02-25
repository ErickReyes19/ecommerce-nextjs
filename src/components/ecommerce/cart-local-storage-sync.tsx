"use client";

import { useEffect } from "react";
import { writeLocalCart, type LocalCartItem } from "@/src/lib/local-cart";

export function CartLocalStorageSync({
  items,
  token,
}: {
  items: LocalCartItem[];
  token?: string;
}) {
  useEffect(() => {
    writeLocalCart({
      token,
      items,
      updatedAt: new Date().toISOString(),
    });
  }, [items, token]);

  return null;
}
