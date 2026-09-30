"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import Locations from "@pixelpay/sdk-core/lib/resources/Locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { startPixelPayHostedCheckout } from "./pixelpay.service";
import { CheckoutTotals, PixelPayCheckoutProps } from "./pixelpay.types";
import { moneyFormatter } from "./pixelpay.utils";

export function PixelPayCheckout({
  cartId,
  shippingMethods,
  defaultCustomerName,
  defaultCustomerEmail,
  defaultPhone,
  defaultAddress,
  defaultCity,
  subtotal,
  onTotalsChange,
}: PixelPayCheckoutProps) {
  const normalizeLocationMap = (value: unknown): Record<string, string> => {
    if (!value || typeof value !== "object") return {};

    if ("default" in value && value.default && typeof value.default === "object" && !Array.isArray(value.default)) {
      return value.default as Record<string, string>;
    }

    return value as Record<string, string>;
  };

  const [isPending, startTransition] = useTransition();
  const [shippingMethodId, setShippingMethodId] = useState<string>(shippingMethods[0]?.id ?? "");
  const [shippingPrice, setShippingPrice] = useState<number>(shippingMethods[0]?.price ?? 0);
  const [totals, setTotals] = useState<CheckoutTotals>({
    subtotal,
    shippingTotal: shippingPrice,
    discountTotal: 0,
    grandTotal: subtotal + shippingPrice,
    appliedCouponCode: null,
    shippingMethodId: shippingMethods[0]?.id ?? "",
  });
  const [couponCodeToValidate, setCouponCodeToValidate] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const hasShippingMethods = shippingMethods.length > 0;

  const selectedShipping = useMemo(
    () => shippingMethods.find((method) => method.id === shippingMethodId),
    [shippingMethodId, shippingMethods],
  );

  const countries = useMemo(() => {
    const countryMap = normalizeLocationMap(Locations.countriesList());
    return Object.entries(countryMap)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, []);

  const [form, setForm] = useState({
    addressId: "",
    couponCode: couponCodeToValidate,
    billing_name: defaultCustomerName,
    billing_last_name: defaultCustomerName.split(" ")[1] || "",
    billing_email: defaultCustomerEmail,
    billing_phone: defaultPhone,
    billing_street: defaultAddress,
    billing_city: defaultCity,
    billing_state: "",
    billing_country: "HN",
    billing_postal_code: "11101",
  });

  const fetchTotals = useCallback(async (couponCode?: string) => {
    const params = new URLSearchParams({ cartId });
    if (shippingMethodId) params.set("shippingMethodId", shippingMethodId);
    const normalizedCoupon = couponCode?.trim().toUpperCase();
    if (normalizedCoupon) params.set("couponCode", normalizedCoupon);

    const response = await fetch(`/api/pixelpay/checkout?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok || !payload.ok) {
      setCouponFeedback(normalizedCoupon ? "Cupón inválido o no disponible" : null);
      return false;
    }

    setShippingPrice(Number(payload.totals.shippingTotal));
    const nextTotals: CheckoutTotals = {
      ...payload.totals,
      shippingMethodId,
    };
    setTotals(nextTotals);
    onTotalsChange?.(nextTotals);

    if (normalizedCoupon) {
      if (payload.totals.appliedCouponCode) {
        setCouponCodeToValidate(payload.totals.appliedCouponCode);
        setForm((prev) => ({ ...prev, couponCode: payload.totals.appliedCouponCode }));
        setCouponFeedback(`Cupón aplicado: ${payload.totals.appliedCouponCode}`);
      } else {
        setCouponCodeToValidate("");
        setCouponFeedback("Cupón inválido o no disponible");
      }
    } else {
      setCouponFeedback(null);
    }

    return true;
  }, [cartId, onTotalsChange, shippingMethodId]);

  useEffect(() => {
    fetchTotals().catch(() => null);
  }, [shippingMethodId, fetchTotals]);

  const departments = useMemo(() => {
    const stateMap = normalizeLocationMap(Locations.statesList(form.billing_country));
    return Object.entries(stateMap)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [form.billing_country]);

  const onSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    startTransition(async () => {
      try {
        toast.loading("Generando enlace seguro de pago...", { id: "pixelpay-checkout" });

        await startPixelPayHostedCheckout({
          checkout: {
            cartId,
            shippingMethodId: shippingMethodId || undefined,
            shippingPrice,
            addressId: form.addressId || undefined,
            couponCode: couponCodeToValidate || undefined,
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
        // El navegador ya se está yendo a PixelPay. El carrito local se vacía en /checkout/resultado,
        // así no se pierde si el cliente cancela.
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al generar el pago", { id: "pixelpay-checkout" });
      }
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Checkout seguro con PixelPay</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="pixelpay-checkout-form" className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="coupon">Cupón</Label>
                <Input
                  id="coupon"
                  value={form.couponCode}
                  placeholder="Ej: BIENVENIDA10"
                  onChange={(e) => setForm((prev) => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={async () => {
                  const coupon = form.couponCode.trim().toUpperCase();
                  setIsValidatingCoupon(true);
                  const ok = await fetchTotals(coupon || undefined).catch(() => false);
                  if (ok && coupon) toast.success("Cupón validado correctamente");
                  if (!ok && coupon) toast.error("No se pudo aplicar el cupón");
                  setIsValidatingCoupon(false);
                }}
                disabled={isValidatingCoupon}
              >
                {isValidatingCoupon ? "Validando..." : "Validar"}
              </Button>
            </div>
            <div className="flex items-center justify-between text-emerald-700"><span>Descuento</span><span>- {moneyFormatter("HNL", totals.discountTotal)}</span></div>
            {couponFeedback ? <p className={`text-xs ${totals.appliedCouponCode ? "text-emerald-700" : "text-destructive"}`}>{couponFeedback}</p> : null}
          </div>

          {hasShippingMethods ? (
            <div className="space-y-2">
              <Label>Método de envío</Label>
              <Select
                value={shippingMethodId}
                onValueChange={(value) => {
                  setShippingMethodId(value);
                  const method = shippingMethods.find((item) => item.id === value);
                  if (method) setShippingPrice(method.price);
                }}
              >
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
          ) : null}

          {hasShippingMethods ? (
            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">Resumen de envío</p>
              <p className="text-muted-foreground">
                {selectedShipping ? `${selectedShipping.name} · ${moneyFormatter("HNL", shippingPrice)}` : "Sin envío"}
              </p>
            </div>
          ) : null}

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">Datos del titular</p>
              <div className="space-y-2"><Label>Nombre</Label><Input value={form.billing_name} onChange={(e) => setForm((prev) => ({ ...prev, billing_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={form.billing_last_name} onChange={(e) => setForm((prev) => ({ ...prev, billing_last_name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.billing_email} onChange={(e) => setForm((prev) => ({ ...prev, billing_email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={form.billing_phone} onChange={(e) => setForm((prev) => ({ ...prev, billing_phone: e.target.value }))} /></div>
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">Pago</p>
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <p>
                  Serás redirigido a la página segura de PixelPay para completar el pago. No ingresas datos de
                  tarjeta en este sitio. Protegido por Ficohsa, 3DS Secure y PixelPay.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Image src="/images/ficohsa.png" alt="Ficohsa" width={120} height={32} className="h-8 w-auto" />
                  <Image src="/images/3ds.png" alt="3DS Secure" width={120} height={32} className="h-8 w-auto" />
                  <Image src="/images/pixelpay.png" alt="PixelPay" width={120} height={32} className="h-8 w-auto" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Dirección de facturación</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2"><Label>Dirección</Label><Input value={form.billing_street} onChange={(e) => setForm((prev) => ({ ...prev, billing_street: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Ciudad</Label><Input value={form.billing_city} onChange={(e) => setForm((prev) => ({ ...prev, billing_city: e.target.value }))} /></div>
              <div className="space-y-2">
                <Label>Departamento / Estado</Label>
                <Select value={form.billing_state} onValueChange={(value) => setForm((prev) => ({ ...prev, billing_state: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un departamento" /></SelectTrigger>
                  <SelectContent>{departments.map((department) => <SelectItem key={department.code} value={department.code}>{department.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={form.billing_country} onValueChange={(value) => setForm((prev) => ({ ...prev, billing_country: value, billing_state: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Selecciona un país" /></SelectTrigger>
                  <SelectContent>{countries.map((country) => <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Código postal</Label><Input value={form.billing_postal_code} onChange={(e) => setForm((prev) => ({ ...prev, billing_postal_code: e.target.value }))} /></div>
            </div>
          </div>

          <button type="submit" hidden disabled={isPending} />
        </form>
      </CardContent>
    </Card>
  );
}
