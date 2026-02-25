import Settings from "@pixelpay/sdk-core/lib/models/Settings";
import OrderModel from "@pixelpay/sdk-core/lib/models/Order";
import ItemModel from "@pixelpay/sdk-core/lib/models/Item";
import CardModel from "@pixelpay/sdk-core/lib/models/Card";
import BillingModel from "@pixelpay/sdk-core/lib/models/Billing";
import SaleTransactionModel from "@pixelpay/sdk-core/lib/requests/SaleTransaction";
import TransactionService from "@pixelpay/sdk-core/lib/services/Transaction";

export type ShippingMethodOption = {
  id: string;
  name: string;
  price: number;
};

export type PixelPayCheckoutProps = {
  cartId: string;
  shippingMethods: ShippingMethodOption[];
  defaultCustomerName: string;
  defaultCustomerEmail: string;
  defaultPhone: string;
  defaultAddress: string;
  defaultCity: string;
};

export type BillingData = {
  billing_name: string;
  billing_last_name: string;
  billing_email: string;
  billing_phone: string;
  billing_street: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_postal_code: string;
};

export type CardData = {
  card_number: string;
  card_cvv: string;
  card_exp_month: string;
  card_exp_year: string;
  card_holder: string;
};

export type InitCheckoutPayload = {
  cartId: string;
  shippingMethodId: string;
  shippingPrice?: number;
  addressId?: string;
  couponCode?: string;
};

export type InitResponse = {
  ok: boolean;
  pagoId: string;
  orderId: string;
  paymentData: {
    amount: number;
    currency: string;
    reference: string;
    description: string;
  };
};

export type PixelPayTransactionData = {
  response_approved?: boolean;
  response_reason?: string;
  [key: string]: unknown;
};

export type PixelPayApiResponse = {
  status?: number | string;
  code?: number | string;
  statusCode?: number | string;
  httpCode?: number | string;
  success?: boolean;
  message?: string;
  responseType?: string;
  type?: string;
  id?: string;
  data?: PixelPayTransactionData;
  [key: string]: unknown;
};

export type SettingsInstance = InstanceType<typeof Settings>;
export type OrderInstance = InstanceType<typeof OrderModel>;
export type ItemInstance = InstanceType<typeof ItemModel>;
export type CardInstance = InstanceType<typeof CardModel>;
export type BillingInstance = InstanceType<typeof BillingModel>;
export type SaleTransactionInstance = InstanceType<typeof SaleTransactionModel>;
export type TransactionServiceInstance = InstanceType<typeof TransactionService>;
