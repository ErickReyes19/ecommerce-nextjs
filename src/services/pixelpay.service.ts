"use client";

import Settings from "@pixelpay/sdk-core/lib/models/Settings";
import OrderModel from "@pixelpay/sdk-core/lib/models/Order";
import ItemModel from "@pixelpay/sdk-core/lib/models/Item";
import CardModel from "@pixelpay/sdk-core/lib/models/Card";
import BillingModel from "@pixelpay/sdk-core/lib/models/Billing";
import SaleTransactionModel from "@pixelpay/sdk-core/lib/requests/SaleTransaction";
import TransactionService from "@pixelpay/sdk-core/lib/services/Transaction";
import type ResponseModel from "@pixelpay/sdk-core/lib/base/Response";
import {
  BillingData,
  CardData,
  InitCheckoutPayload,
  InitResponse,
  PixelPayApiResponse,
} from "@/src/services/pixelpay.types";
import { validateCheckoutInput } from "@/src/services/pixelpay.utils";

function isApprovedPayment(result: PixelPayApiResponse | undefined) {
  const status = Number(result?.status ?? result?.statusCode ?? result?.code);
  const success = result?.success === true;
  const approved = result?.data?.response_approved === true;
  return (Number.isFinite(status) ? status >= 200 && status < 300 : false) && success && approved;
}

function normalizeResponse(response: ResponseModel): PixelPayApiResponse {
  return {
    status: response.status,
    success: response.success,
    message: response.message,
    data: typeof response.data === "object" && response.data ? response.data : undefined,
    ...(typeof response.data === "object" && response.data ? (response.data as Record<string, unknown>) : {}),
  };
}

export async function runPixelPayCheckout(input: {
  checkout: InitCheckoutPayload;
  card: CardData;
  billing: BillingData;
}) {
  validateCheckoutInput(input);

  const initResponse = await fetch("/api/pixelpay/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.checkout),
  });

  const initJson = (await initResponse.json()) as InitResponse & { message?: string };

  if (!initResponse.ok || !initJson.ok) {
    throw new Error(initJson.message ?? "No se pudo inicializar el pago");
  }

  const settings = new Settings();
  settings.setupEndpoint?.(process.env.NEXT_PUBLIC_PIXELPAY_ENDPOINT ?? "");
  settings.setupCredentials?.(
    process.env.NEXT_PUBLIC_PIXELPAY_KEY_ID ?? "",
    process.env.NEXT_PUBLIC_PIXELPAY_KEY_HASH ?? "",
  );

  const order = new OrderModel();
  order.id = initJson.paymentData.reference;
  order.amount = initJson.paymentData.amount;
  order.currency = initJson.paymentData.currency;
  order.note = initJson.paymentData.description;

  const item = new ItemModel();
  item.code = initJson.paymentData.reference;
  item.title = initJson.paymentData.description;
  item.price = initJson.paymentData.amount;
  item.qty = 1;
  item.totalize();

  order.addItem(item);
  order.totalize();
  order.customer_name = `${input.billing.billing_name} ${input.billing.billing_last_name}`;
  order.customer_email = input.billing.billing_email;

  const card = new CardModel();
  card.number = input.card.card_number.replace(/\s+/g, "");
  card.cardholder = input.card.card_holder;
  card.cvv2 = input.card.card_cvv;
  card.expire_month = Number(input.card.card_exp_month);
  card.expire_year = Number(input.card.card_exp_year.length === 2 ? `20${input.card.card_exp_year}` : input.card.card_exp_year);

  const billing = new BillingModel();
  billing.address = input.billing.billing_street;
  billing.city = input.billing.billing_city;
  billing.state = input.billing.billing_state;
  billing.country = input.billing.billing_country;
  billing.zip = input.billing.billing_postal_code;
  billing.phone = input.billing.billing_phone;

  const sale = new SaleTransactionModel();
  sale.setOrder(order);
  sale.setCard(card);
  sale.setBilling(billing);

  const service = new TransactionService(settings);
  let result: PixelPayApiResponse | undefined;
  let isValidPayment = false;

  try {
    const response = await service.doSale(sale);
    result = normalizeResponse(response);
    isValidPayment = isApprovedPayment(result);
    return {
      ...(await closePayment(initJson.pagoId, result, isValidPayment, initJson.paymentData.reference)),
      result,
      isValidPayment,
    };
  } catch (error) {
    await closePayment(
      initJson.pagoId,
      {
        success: false,
        message: error instanceof Error ? error.message : "Error no controlado con PixelPay",
      },
      false,
      initJson.paymentData.reference,
    );
    throw error;
  }
}

async function closePayment(
  pagoId: string,
  result: PixelPayApiResponse,
  isValidPayment: boolean,
  reference: string,
) {
  const closeResponse = await fetch("/api/pixelpay/checkout", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pagoId, result, isValidPayment, reference }),
  });

  const closeJson = (await closeResponse.json()) as { ok: boolean; message?: string; orderId?: string };
  if (!closeResponse.ok || !closeJson.ok) {
    throw new Error(closeJson.message ?? "No se pudo cerrar el pago");
  }

  return closeJson;
}
