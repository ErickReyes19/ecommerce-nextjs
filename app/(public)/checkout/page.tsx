import { cookies } from "next/headers";
import { getSession } from "@/auth";
import { redirect } from "next/navigation";
import { PixelPayCheckout } from "./components/pixelpay-checkout";
import { getCheckoutData } from "./actions";

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

  return (
    <main className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
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
    </main>
  );
}
