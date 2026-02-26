import { cookies } from "next/headers";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { PixelPayCheckout } from "./components/pixelpay-checkout";
import { moneyFormatter } from "./components/pixelpay.utils";
import { getCheckoutData } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/checkout");
  }

  const token = cookies().get("guest_cart")?.value;
  const { cart, methods, currentUser } = await getCheckoutData(token, session.IdUser);

  if (!cart || cart.items.length === 0) {
    redirect("/carrito");
  }

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity,
    0,
  );

  const discountTotal = cart.items.reduce((acc, item) => {
    const baseUnit = Number(item.variant?.price ?? item.product.basePrice);
    const effectiveUnit = Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice);
    const unitDiscount = Math.max(baseUnit - effectiveUnit, 0);
    return acc + unitDiscount * item.quantity;
  }, 0);

  const defaultShippingMethod = methods[0];
  const shippingTotal = Number(defaultShippingMethod?.price ?? 0);
  const estimatedGrandTotal = subtotal + shippingTotal;

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
          shippingMethods={methods.map((method) => ({ id: method.id, name: method.name, price: Number(method.price) }))}
          subtotal={subtotal}
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
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{moneyFormatter("HNL", subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-700">
              <span>Rebaja</span>
              <span>- {moneyFormatter("HNL", discountTotal)}</span>
            </div>
            <div className="space-y-1 rounded-md border p-2">
              <p className="text-muted-foreground">Método de envío</p>
              <p className="font-medium">
                {defaultShippingMethod ? `${defaultShippingMethod.name} · ${moneyFormatter("HNL", shippingTotal)}` : "Sin método de envío"}
              </p>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
              <span>Total estimado</span>
              <span>{moneyFormatter("HNL", estimatedGrandTotal)}</span>
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
