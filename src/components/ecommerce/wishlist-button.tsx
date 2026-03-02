"use client";

import { useMemo, useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { removeLocalWishlistProduct, upsertLocalWishlistProduct } from "@/src/lib/local-wishlist";
import { toggleWishlistItem } from "@/src/actions/wishlist-actions";

export function WishlistButton({
  productId,
  initialIsInWishlist,
}: {
  productId: string;
  initialIsInWishlist: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist);

  const label = useMemo(() => {
    if (isPending) return "Actualizando...";
    return isInWishlist ? "Quitar de deseos" : "Agregar a deseos";
  }, [isInWishlist, isPending]);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleWishlistItem(productId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      const added = result?.action === "added";
      setIsInWishlist(added);

      if (added) {
        upsertLocalWishlistProduct(productId);
        toast.success("Producto agregado a lista de deseos");
      } else {
        removeLocalWishlistProduct(productId);
        toast.success("Producto eliminado de lista de deseos");
      }
    });
  };

  return (
    <Button
      type="button"
      onClick={handleToggle}
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full"
      disabled={isPending}
      aria-label={label}
      title={label}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
      )}
    </Button>
  );
}
