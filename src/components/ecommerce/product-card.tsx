import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  product: { id: string; name: string; slug: string; basePrice: number; compareAtPrice?: number | null; category: { name: string } };
};

export function ProductCard({ product }: Props) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="outline" className="w-fit">{product.category.name}</Badge>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">${product.basePrice.toFixed(2)}</p>
        {product.compareAtPrice ? <p className="text-sm line-through text-muted-foreground">${product.compareAtPrice.toFixed(2)}</p> : null}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full"><Link href={`/productos/${product.slug}`}>Ver detalle</Link></Button>
      </CardFooter>
    </Card>
  );
}
