import { BillingData, CardData, InitCheckoutPayload } from "./pixelpay.types";

export function validateCheckoutInput(input: {
  checkout: InitCheckoutPayload;
  card: CardData;
  billing: BillingData;
}) {
  const requiredCheckout: Array<keyof InitCheckoutPayload> = ["cartId"];
  for (const key of requiredCheckout) {
    if (!input.checkout[key]) {
      throw new Error(`Falta el campo obligatorio: ${key}`);
    }
  }

  const requiredCard: Array<keyof CardData> = [
    "card_number",
    "card_cvv",
    "card_exp_month",
    "card_exp_year",
    "card_holder",
  ];

  for (const key of requiredCard) {
    if (!input.card[key]?.trim()) {
      throw new Error(`Falta el dato de tarjeta: ${key}`);
    }
  }

  const requiredBilling: Array<keyof BillingData> = [
    "billing_name",
    "billing_last_name",
    "billing_email",
    "billing_phone",
    "billing_street",
    "billing_city",
    "billing_state",
    "billing_country",
    "billing_postal_code",
  ];

  for (const key of requiredBilling) {
    if (!input.billing[key]?.trim()) {
      throw new Error(`Falta el dato de facturación: ${key}`);
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
