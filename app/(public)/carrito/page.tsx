import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CarritoPage() {
  const token = cookies().get("guest_cart")?.value;
  const cart = token
    ? await prisma.cart.findUnique({ where: { token }, include: { items: { include: { product: true, variant: true } } } })
    : null;

  const total = cart?.items.reduce((acc, item) => acc + Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity, 0) ?? 0;

  return (
    <main className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-3xl font-bold">Tu carrito</h1>
      {cart?.items.length ? cart.items.map((item) => (
        <div key={item.id} className="rounded-lg border p-4 flex justify-between">
          <div>
            <p className="font-semibold">{item.product.name}</p>
            <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
          </div>
          <p>${(Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity).toFixed(2)}</p>
        </div>
      )) : <p>No hay items en tu carrito.</p>}
      <div className="flex justify-between items-center">
        <p className="text-xl font-semibold">Total: ${total.toFixed(2)}</p>
        <Button asChild><Link href="/checkout">Ir a checkout</Link></Button>
      </div>
    </main>
  );
}
