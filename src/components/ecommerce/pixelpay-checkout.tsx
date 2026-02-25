"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { runPixelPayCheckout } from "@/src/services/pixelpay.service";
import { moneyFormatter } from "@/src/services/pixelpay.utils";

type ShippingMethodOption = {
  id: string;
  name: string;
  price: number;
};

type PixelPayCheckoutProps = {
  cartId: string;
  shippingMethods: ShippingMethodOption[];
  defaultCustomerName: string;
  defaultCustomerEmail: string;
  defaultPhone: string;
  defaultAddress: string;
  defaultCity: string;
};

export function PixelPayCheckout({
  cartId,
  shippingMethods,
  defaultCustomerName,
  defaultCustomerEmail,
  defaultPhone,
  defaultAddress,
  defaultCity,
}: PixelPayCheckoutProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [shippingMethodId, setShippingMethodId] = useState<string>(shippingMethods[0]?.id ?? "");

  const selectedShipping = useMemo(
    () => shippingMethods.find((method) => method.id === shippingMethodId),
    [shippingMethodId, shippingMethods],
  );

  const [form, setForm] = useState({
    addressId: "",
    couponCode: "",
    card_holder: defaultCustomerName,
    card_number: "",
    card_exp_month: "",
    card_exp_year: "",
    card_cvv: "",
    billing_name: defaultCustomerName,
    billing_last_name: "",
    billing_email: defaultCustomerEmail,
    billing_phone: defaultPhone,
    billing_street: defaultAddress,
    billing_city: defaultCity,
    billing_state: "",
    billing_country: "HN",
    billing_postal_code: "11101",
  });

  const onSubmit = () => {
    setMessage("");

    startTransition(async () => {
      try {
        const response = await runPixelPayCheckout({
          checkout: {
            cartId,
            shippingMethodId,
            addressId: form.addressId || undefined,
            couponCode: form.couponCode || undefined,
          },
          card: {
            card_holder: form.card_holder,
            card_number: form.card_number,
            card_exp_month: form.card_exp_month,
            card_exp_year: form.card_exp_year,
            card_cvv: form.card_cvv,
          },
          billing: {
            billing_name: form.billing_name,
            billing_last_name: form.billing_last_name,
            billing_email: form.billing_email,
            billing_phone: form.billing_phone,
            billing_street: form.billing_street,
            billing_city: form.billing_city,
            billing_state: form.billing_state,
            billing_country: form.billing_country,
            billing_postal_code: form.billing_postal_code,
          },
        });

        if (!response.isValidPayment) {
          setMessage("El pago fue rechazado. Verifica tu tarjeta e inténtalo de nuevo.");
          return;
        }

        setMessage("Pago aprobado. Redirigiendo...");
        router.push(`/perfil?orderId=${response.orderId ?? ""}`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Error al procesar pago");
      }
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Checkout seguro con PixelPay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Método de envío</Label>
            <Select value={shippingMethodId} onValueChange={setShippingMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método de envío" />
              </SelectTrigger>
              <SelectContent>
                {shippingMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name} · {moneyFormatter("HNL", method.price)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Resumen de envío</p>
            <p className="text-muted-foreground">
              {selectedShipping ? `${selectedShipping.name} · ${moneyFormatter("HNL", selectedShipping.price)}` : "Sin envío"}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Datos del cliente</p>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input value={form.billing_name} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Correo</Label>
              <Input type="email" value={form.billing_email} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={form.billing_phone}
                onChange={(e) => setForm((prev) => ({ ...prev, billing_phone: e.target.value }))}
                inputMode="tel"
                placeholder="Ej: +504 9999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label>Cupón (opcional)</Label>
              <Input
                value={form.couponCode}
                onChange={(e) => setForm((prev) => ({ ...prev, couponCode: e.target.value }))}
                placeholder="Código de descuento"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Tarjeta</p>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <p>
                Tus datos de tarjeta van cifrados. Checkout protegido por Ficohsa, 3DS Secure y PixelPay.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Image src="/images/ficohsa.png" alt="Ficohsa" width={120} height={32} className="h-8 w-auto" />
                <Image src="/images/3ds.png" alt="3DS Secure" width={120} height={32} className="h-8 w-auto" />
                <Image src="/images/pixelpay.png" alt="PixelPay" width={120} height={32} className="h-8 w-auto" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nombre en tarjeta</Label>
              <Input
                value={form.card_holder}
                onChange={(e) => setForm((prev) => ({ ...prev, card_holder: e.target.value }))}
                placeholder="Como aparece en la tarjeta"
              />
            </div>
            <div className="space-y-2">
              <Label>Número de tarjeta</Label>
              <Input
                value={form.card_number}
                onChange={(e) => setForm((prev) => ({ ...prev, card_number: e.target.value }))}
                inputMode="numeric"
                maxLength={19}
                placeholder="4111 1111 1111 1111"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Mes (MM)</Label>
                <Input
                  value={form.card_exp_month}
                  onChange={(e) => setForm((prev) => ({ ...prev, card_exp_month: e.target.value }))}
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="07"
                />
              </div>
              <div className="space-y-2">
                <Label>Año (YY)</Label>
                <Input
                  value={form.card_exp_year}
                  onChange={(e) => setForm((prev) => ({ ...prev, card_exp_year: e.target.value }))}
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="28"
                />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input
                  value={form.card_cvv}
                  onChange={(e) => setForm((prev) => ({ ...prev, card_cvv: e.target.value }))}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="999"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Dirección de facturación</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Dirección</Label>
              <Input
                value={form.billing_street}
                onChange={(e) => setForm((prev) => ({ ...prev, billing_street: e.target.value }))}
                placeholder="Colonia, calle, número de casa"
              />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input
                value={form.billing_city}
                onChange={(e) => setForm((prev) => ({ ...prev, billing_city: e.target.value }))}
                placeholder="San Pedro Sula"
              />
            </div>
            <div className="space-y-2">
              <Label>Departamento / Estado</Label>
              <Input
                value={form.billing_state}
                onChange={(e) => setForm((prev) => ({ ...prev, billing_state: e.target.value }))}
                placeholder="Cortés"
              />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Input
                value={form.billing_country}
                onChange={(e) => setForm((prev) => ({ ...prev, billing_country: e.target.value.toUpperCase() }))}
                placeholder="HN"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Código postal</Label>
              <Input
                value={form.billing_postal_code}
                onChange={(e) => setForm((prev) => ({ ...prev, billing_postal_code: e.target.value }))}
                placeholder="11101"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>ID de dirección (opcional)</Label>
              <Input
                value={form.addressId}
                onChange={(e) => setForm((prev) => ({ ...prev, addressId: e.target.value }))}
                placeholder="Si tienes una dirección guardada, colócala aquí"
              />
            </div>
          </div>
        </div>

        <Button type="button" disabled={isPending || !shippingMethodId} onClick={onSubmit}>
          {isPending ? "Procesando..." : "Pagar con PixelPay"}
        </Button>

        {message ? <p className="text-sm">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
