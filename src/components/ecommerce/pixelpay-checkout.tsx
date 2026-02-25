"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { runPixelPayCheckout } from "@/src/services/pixelpay.service";
import { moneyFormatter } from "@/src/services/pixelpay.utils";

type ShippingMethodOption = {
  id: string;
  name: string;
  price: number;
};

export function PixelPayCheckout({
  cartId,
  shippingMethods,
}: {
  cartId: string;
  shippingMethods: ShippingMethodOption[];
}) {
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
    card_holder: "",
    card_number: "",
    card_exp_month: "",
    card_exp_year: "",
    card_cvv: "",
    billing_name: "",
    billing_last_name: "",
    billing_email: "",
    billing_phone: "",
    billing_street: "",
    billing_city: "",
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
    <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
      <Input
        value={form.addressId}
        onChange={(e) => setForm((prev) => ({ ...prev, addressId: e.target.value }))}
        placeholder="ID de dirección"
      />
      <Input
        value={form.couponCode}
        onChange={(e) => setForm((prev) => ({ ...prev, couponCode: e.target.value }))}
        placeholder="Cupón (opcional)"
      />

      <div className="space-y-2">
        <Label>Método de envío</Label>
        <Select value={shippingMethodId} onValueChange={setShippingMethodId}>
          <SelectTrigger>
            <SelectValue placeholder="Método de envío" />
          </SelectTrigger>
          <SelectContent>
            {shippingMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name} - {moneyFormatter("HNL", method.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border p-3 text-sm text-muted-foreground md:col-span-2">
        Pagando con PixelPay {selectedShipping ? `· Envío: ${moneyFormatter("HNL", selectedShipping.price)}` : ""}
      </div>

      <Input value={form.card_holder} onChange={(e) => setForm((prev) => ({ ...prev, card_holder: e.target.value }))} placeholder="Nombre en tarjeta" />
      <Input value={form.card_number} onChange={(e) => setForm((prev) => ({ ...prev, card_number: e.target.value }))} placeholder="Número de tarjeta" />
      <Input value={form.card_exp_month} onChange={(e) => setForm((prev) => ({ ...prev, card_exp_month: e.target.value }))} placeholder="Mes vencimiento (MM)" />
      <Input value={form.card_exp_year} onChange={(e) => setForm((prev) => ({ ...prev, card_exp_year: e.target.value }))} placeholder="Año vencimiento (YY)" />
      <Input value={form.card_cvv} onChange={(e) => setForm((prev) => ({ ...prev, card_cvv: e.target.value }))} placeholder="CVV" />

      <Input value={form.billing_name} onChange={(e) => setForm((prev) => ({ ...prev, billing_name: e.target.value }))} placeholder="Nombre facturación" />
      <Input value={form.billing_last_name} onChange={(e) => setForm((prev) => ({ ...prev, billing_last_name: e.target.value }))} placeholder="Apellido facturación" />
      <Input value={form.billing_email} onChange={(e) => setForm((prev) => ({ ...prev, billing_email: e.target.value }))} placeholder="Email facturación" />
      <Input value={form.billing_phone} onChange={(e) => setForm((prev) => ({ ...prev, billing_phone: e.target.value }))} placeholder="Teléfono" />
      <Input value={form.billing_street} onChange={(e) => setForm((prev) => ({ ...prev, billing_street: e.target.value }))} placeholder="Dirección" />
      <Input value={form.billing_city} onChange={(e) => setForm((prev) => ({ ...prev, billing_city: e.target.value }))} placeholder="Ciudad" />
      <Input value={form.billing_state} onChange={(e) => setForm((prev) => ({ ...prev, billing_state: e.target.value }))} placeholder="Departamento" />
      <Input value={form.billing_country} onChange={(e) => setForm((prev) => ({ ...prev, billing_country: e.target.value }))} placeholder="País" />
      <Input value={form.billing_postal_code} onChange={(e) => setForm((prev) => ({ ...prev, billing_postal_code: e.target.value }))} placeholder="Código postal" />

      <Button type="button" className="md:col-span-2" disabled={isPending || !shippingMethodId} onClick={onSubmit}>
        {isPending ? "Procesando..." : "Pagar con PixelPay"}
      </Button>

      {message ? <p className="text-sm md:col-span-2">{message}</p> : null}
    </div>
  );
}
