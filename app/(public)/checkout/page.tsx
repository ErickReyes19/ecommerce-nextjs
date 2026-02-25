import { prisma } from "@/lib/prisma";
import { createOrder } from "@/src/actions/order-actions";
import { cookies } from "next/headers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function CheckoutPage() {
  const token = cookies().get("guest_cart")?.value;
  const cart = token ? await prisma.cart.findUnique({ where: { token } }) : null;
  const methods = await prisma.shippingMethod.findMany({ where: { active: true } });

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form action={async (fd) => {
        "use server";
        if (!cart) return;
        await createOrder({
          addressId: fd.get("addressId"),
          shippingMethodId: fd.get("shippingMethodId"),
          paymentMethod: fd.get("paymentMethod"),
          couponCode: fd.get("couponCode"),
        }, cart.id);
      }} className="grid gap-4 md:grid-cols-2">
        <Input name="addressId" placeholder="ID de dirección" required />
        <Input name="couponCode" placeholder="Cupón (opcional)" />
        <Select name="shippingMethodId">
          <SelectTrigger><SelectValue placeholder="Método de envío" /></SelectTrigger>
          <SelectContent>{methods.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} - ${Number(m.price).toFixed(2)}</SelectItem>)}</SelectContent>
        </Select>
        <Select name="paymentMethod" defaultValue="stripe">
          <SelectTrigger><SelectValue placeholder="Método de pago" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="md:col-span-2">Confirmar pedido</Button>
      </form>
    </main>
  );
}
