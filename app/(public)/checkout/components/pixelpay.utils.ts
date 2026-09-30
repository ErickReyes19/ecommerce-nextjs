import { BillingData, InitCheckoutPayload } from "./pixelpay.types";

export function validateCheckoutInput(input: { checkout: InitCheckoutPayload; billing: BillingData }) {
  if (!input.checkout.cartId) {
    throw new Error("Falta el campo obligatorio: cartId");
  }

  const requiredBilling: Array<[keyof BillingData, string]> = [
    ["billing_name", "nombre"],
    ["billing_email", "email"],
    ["billing_street", "dirección"],
  ];

  for (const [key, label] of requiredBilling) {
    if (!input.billing[key]?.trim()) {
      throw new Error(`Falta el dato de facturación: ${label}`);
    }
  }
}

export function moneyFormatter(currency: string, amount: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
