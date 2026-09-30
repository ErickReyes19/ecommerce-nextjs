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
  subtotal: number;
  onTotalsChange?: (totals: CheckoutTotals) => void;
};

export type CheckoutTotals = {
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  appliedCouponCode: string | null;
  shippingMethodId: string;
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

export type InitCheckoutPayload = {
  cartId: string;
  shippingMethodId?: string;
  shippingPrice?: number;
  addressId?: string;
  couponCode?: string;
};

export type InitResponse = {
  ok: boolean;
  paymentId: string;
  orderId: string;
  paymentUrl: string;
};
