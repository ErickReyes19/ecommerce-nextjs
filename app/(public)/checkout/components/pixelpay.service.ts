"use client";

import { BillingData, InitCheckoutPayload, InitResponse } from "./pixelpay.types";
import { validateCheckoutInput } from "./pixelpay.utils";

export async function startPixelPayHostedCheckout(input: { checkout: InitCheckoutPayload; billing: BillingData }) {
  validateCheckoutInput(input);

  const response = await fetch("/api/pixelpay/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input.checkout,
      customer: {
        firstName: input.billing.billing_name,
        lastName: input.billing.billing_last_name,
        email: input.billing.billing_email,
        phone: input.billing.billing_phone,
        address: input.billing.billing_street,
        city: input.billing.billing_city,
        state: input.billing.billing_state,
        country: input.billing.billing_country,
        zip: input.billing.billing_postal_code,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as (InitResponse & { message?: string }) | null;
  if (!response.ok || !data?.ok || !data.paymentUrl) {
    throw new Error(data?.message ?? "No se pudo generar el enlace de pago");
  }

  // Misma pestaña: window.open lo bloquean los bloqueadores de pop-ups
  window.location.assign(data.paymentUrl);
}
