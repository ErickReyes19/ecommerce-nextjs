import { prisma } from "@/lib/prisma";
import { createOrder } from "@/src/actions/order-actions";
import { cookies } from "next/headers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  const token = cookies().get("guest_cart")?.value;
  const cart = token
    ? await prisma.cart.findUnique({
        where: { token },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      })
    : null;

  if (!cart || cart.items.length === 0) {
    redirect("/carrito");
  }

  const methods = await prisma.shippingMethod.findMany({ where: { active: true }, orderBy: { name: "asc" } });

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity,
    0,
  );

  return (
    <main className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <form
          action={async (fd) => {
            "use server";
            await createOrder(
              {
                addressId: fd.get("addressId"),
                shippingMethodId: fd.get("shippingMethodId"),
                paymentMethod: fd.get("paymentMethod"),
                couponCode: fd.get("couponCode"),
              },
              cart.id,
            );
          }}
          className="grid gap-4 md:grid-cols-2 lg:col-span-2"
        >
          <Input name="addressId" placeholder="ID de dirección" required />
          <Input name="couponCode" placeholder="Cupón (opcional)" />
          <Select name="shippingMethodId">
            <SelectTrigger>
              <SelectValue placeholder="Método de envío" />
            </SelectTrigger>
            <SelectContent>
              {methods.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} - ${Number(m.price).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="paymentMethod" defaultValue="stripe">
            <SelectTrigger>
              <SelectValue placeholder="Método de pago" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="md:col-span-2">
            Confirmar pedido
          </Button>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {cart.items.map((item) => {
              const unit = Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice);
              return (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <p className="line-clamp-1 text-muted-foreground">
                    {item.product.name} x{item.quantity}
                  </p>
                  <p className="font-medium">${(unit * item.quantity).toFixed(2)}</p>
                </div>
              );
            })}
            <div className="border-t pt-2 flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
