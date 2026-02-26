import { cookies } from "next/headers";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { getCheckoutData } from "./actions";
import { CheckoutLayout } from "./components/checkout-layout";

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

  const defaultShippingMethod = methods[0];
  const shippingTotal = Number(defaultShippingMethod?.price ?? 0);

  return (
    <main className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <CheckoutLayout
        cartId={cart.id}
        items={cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          productName: item.product.name,
          unitPrice: Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice),
        }))}
        defaultCustomerName={currentUser?.nombre ?? session.Nombre ?? ""}
        defaultCustomerEmail={currentUser?.email ?? ""}
        defaultPhone={currentUser?.telefono ?? ""}
        defaultAddress={currentUser?.direccion ?? ""}
        defaultCity={currentUser?.ciudad ?? ""}
        shippingMethods={methods.map((method) => ({ id: method.id, name: method.name, price: Number(method.price) }))}
        initialTotals={{
          subtotal,
          shippingTotal,
          discountTotal: 0,
          grandTotal: subtotal + shippingTotal,
          appliedCouponCode: null,
          shippingMethodId: defaultShippingMethod?.id ?? "",
        }}
      />
    </main>
  );
}
