"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { addToCart } from "@/src/actions/cart-actions";
import { toast } from "sonner";
import { upsertLocalCartItem } from "@/src/lib/local-cart";

export function AddToCartButton({
  productId,
  variantId,
  disabled = false,
}: {
  productId: string;
  variantId?: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    startTransition(async () => {
      const result = await addToCart({
        productId,
        variantId,
        quantity: 1,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        upsertLocalCartItem({
          productId,
          variantId,
          quantity: 1,
        });
        toast.success("Producto agregado al carrito");
      }
    });
  };

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled || isPending}
      size="lg"
      className="w-full rounded-full"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingBag className="mr-2 h-4 w-4" />
      )}
      {isPending ? "Agregando..." : "Agregar al carrito"}
    </Button>
  );
}
