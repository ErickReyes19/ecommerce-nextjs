import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PixelPayCheckout } from "./components/pixelpay-checkout";
import { moneyFormatter } from "./components/pixelpay.utils";

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

  const currentUser = await prisma.usuarios.findUnique({
    where: { id: session.IdUser },
    select: {
      nombre: true,
      email: true,
      telefono: true,
      direccion: true,
      ciudad: true,
    },
  });

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity,
    0,
  );

  return (
    <main className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <PixelPayCheckout
          cartId={cart.id}
          defaultCustomerName={currentUser?.nombre ?? session.Nombre ?? ""}
          defaultCustomerEmail={currentUser?.email ?? ""}
          defaultPhone={currentUser?.telefono ?? ""}
          defaultAddress={currentUser?.direccion ?? ""}
          defaultCity={currentUser?.ciudad ?? ""}
          shippingMethods={methods.map((method) => ({
            id: method.id,
            name: method.name,
            price: Number(method.price),
          }))}
        />

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
                  <p className="font-medium">{moneyFormatter("HNL", unit * item.quantity)}</p>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{moneyFormatter("HNL", subtotal)}</span>
            </div>
            <Button type="submit" form="pixelpay-checkout-form" className="w-full">
              Pagar con PixelPay
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
