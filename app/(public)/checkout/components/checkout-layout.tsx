"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelPayCheckout } from "./pixelpay-checkout";
import { CheckoutTotals, ShippingMethodOption } from "./pixelpay.types";
import { moneyFormatter } from "./pixelpay.utils";

type CheckoutItem = {
  id: string;
  quantity: number;
  productName: string;
  unitPrice: number;
};

type CheckoutLayoutProps = {
  cartId: string;
  items: CheckoutItem[];
  shippingMethods: ShippingMethodOption[];
  defaultCustomerName: string;
  defaultCustomerEmail: string;
  defaultPhone: string;
  defaultAddress: string;
  defaultCity: string;
  initialTotals: CheckoutTotals;
};

export function CheckoutLayout({
  cartId,
  items,
  shippingMethods,
  defaultCustomerName,
  defaultCustomerEmail,
  defaultPhone,
  defaultAddress,
  defaultCity,
  initialTotals,
}: CheckoutLayoutProps) {
  const [totals, setTotals] = useState(initialTotals);
  const selectedShippingMethod = shippingMethods.find((method) => method.id === totals.shippingMethodId);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <PixelPayCheckout
        cartId={cartId}
        defaultCustomerName={defaultCustomerName}
        defaultCustomerEmail={defaultCustomerEmail}
        defaultPhone={defaultPhone}
        defaultAddress={defaultAddress}
        defaultCity={defaultCity}
        shippingMethods={shippingMethods}
        subtotal={initialTotals.subtotal}
        onTotalsChange={setTotals}
      />

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <p className="line-clamp-1 text-muted-foreground">
                {item.productName} x{item.quantity}
              </p>
              <p className="font-medium">{moneyFormatter("HNL", item.unitPrice * item.quantity)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{moneyFormatter("HNL", totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700">
            <span>Descuento</span>
            <span>- {moneyFormatter("HNL", totals.discountTotal)}</span>
          </div>
          <div className="space-y-1 rounded-md border p-2">
            <p className="text-muted-foreground">Método de envío</p>
            <p className="font-medium">
              {selectedShippingMethod ? `${selectedShippingMethod.name} · ${moneyFormatter("HNL", totals.shippingTotal)}` : "Sin método de envío"}
            </p>
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
            <span>Total estimado</span>
            <span>{moneyFormatter("HNL", totals.grandTotal)}</span>
          </div>
          <Button type="submit" form="pixelpay-checkout-form" className="w-full">
            Pagar con PixelPay
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
