import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MiniCart({ count = 0 }: { count?: number }) {
  return (
    <Button asChild variant="outline" className="relative">
      <Link href="/carrito">
        <ShoppingCart className="h-4 w-4" />
        Carrito
        <Badge className="ml-2" variant="secondary">{count}</Badge>
      </Link>
    </Button>
  );
}
