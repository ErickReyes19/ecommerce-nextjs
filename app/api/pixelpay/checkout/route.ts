import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrCreateEcommerceUserBySessionUserId } from "@/src/lib/ecommerce-user";
import { createHostedPaymentLink } from "@/lib/pixelpay-hosted";
import { failPixelPayPayment, type PaymentMetadata } from "@/lib/pixelpay-settle";

export const runtime = "nodejs";

const PAYMENT_PROVIDER = "PIXELPAY";
const PAYMENT_CURRENCY = "HNL";

type CouponContext = {
  subtotal: number;
  items: Array<{ productId: string; categoryId: string | null; lineTotal: number }>;
};

async function calculateDiscount(couponCode: string | undefined, context: CouponContext) {
  if (!couponCode?.trim()) {
    return { couponId: null as string | null, discountTotal: 0, couponCode: null as string | null };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: couponCode.trim().toUpperCase() },
    select: {
      id: true,
      code: true,
      type: true,
      target: true,
      value: true,
      maxDiscount: true,
      minSubtotal: true,
      startsAt: true,
      endsAt: true,
      usageLimit: true,
      usedCount: true,
      active: true,
      productId: true,
      categoryId: true,
    },
  });

  if (!coupon || !coupon.active) return { couponId: null, discountTotal: 0, couponCode: null };

  const now = new Date();
  if ((coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) return { couponId: null, discountTotal: 0, couponCode: null };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { couponId: null, discountTotal: 0, couponCode: null };
  if (coupon.minSubtotal && context.subtotal < Number(coupon.minSubtotal)) return { couponId: null, discountTotal: 0, couponCode: null };

  let discountBase = context.subtotal;
  if (coupon.target === "PRODUCT" && coupon.productId) {
    discountBase = context.items.filter((item) => item.productId === coupon.productId).reduce((acc, item) => acc + item.lineTotal, 0);
  }
  if (coupon.target === "CATEGORY" && coupon.categoryId) {
    discountBase = context.items.filter((item) => item.categoryId === coupon.categoryId).reduce((acc, item) => acc + item.lineTotal, 0);
  }

  if (discountBase <= 0) return { couponId: null, discountTotal: 0, couponCode: null };

  let discountTotal = coupon.type === "PERCENTAGE" ? (discountBase * Number(coupon.value)) / 100 : Number(coupon.value);
  if (coupon.maxDiscount) {
    discountTotal = Math.min(discountTotal, Number(coupon.maxDiscount));
  }
  discountTotal = Math.max(0, Math.min(discountTotal, discountBase));

  return { couponId: coupon.id, couponCode: coupon.code, discountTotal };
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) {
    return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
  }

  const ecommerceUser = await getOrCreateEcommerceUserBySessionUserId(session.IdUser);

  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId") ?? "";
  const shippingMethodId = searchParams.get("shippingMethodId") ?? "";
  const couponCode = searchParams.get("couponCode") ?? undefined;

  if (!cartId) {
    return NextResponse.json({ ok: false, message: "Faltan datos para calcular totales" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: { select: { basePrice: true, categoryId: true } }, variant: true } } },
  });

  const shippingMethod = shippingMethodId
    ? await prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } })
    : null;

  if (!cart) {
    return NextResponse.json({ ok: false, message: "No se pudo calcular el total" }, { status: 404 });
  }

  const guestToken = cookies().get("guest_cart")?.value;
  const isGuestCartAuthorized = Boolean(cart.token && guestToken && cart.token === guestToken);
  const isUserCartAuthorized = Boolean(ecommerceUser?.id && cart.userId === ecommerceUser.id);
  if (!isGuestCartAuthorized && !isUserCartAuthorized) {
    return NextResponse.json({ ok: false, message: "Carrito no autorizado" }, { status: 403 });
  }

  if (shippingMethodId && (!shippingMethod || !shippingMethod.active)) {
    return NextResponse.json({ ok: false, message: "No se pudo calcular el total" }, { status: 404 });
  }

  const lines = cart.items.map((item) => {
    const unitPrice = Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice);
    return {
      productId: item.productId,
      categoryId: item.product.categoryId,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lines.reduce((acc, item) => acc + item.lineTotal, 0);
  const shippingTotal = Number(shippingMethod?.price ?? 0);
  const discount = await calculateDiscount(couponCode, { subtotal, items: lines });
  const grandTotal = Math.max(0, subtotal + shippingTotal - discount.discountTotal);

  return NextResponse.json({
    ok: true,
    totals: {
      subtotal,
      shippingTotal,
      discountTotal: discount.discountTotal,
      grandTotal,
      appliedCouponCode: discount.couponCode,
    },
  });
}


type CheckoutCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) {
    return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
  }

  const body = (await request.json()) as {
    cartId?: string;
    shippingMethodId?: string;
    addressId?: string;
    couponCode?: string;
    customer?: CheckoutCustomer;
  };

  const customerEmail = body.customer?.email?.trim();
  if (!body.cartId || !customerEmail) {
    return NextResponse.json({ ok: false, message: "Faltan datos para inicializar checkout" }, { status: 400 });
  }

  const ecommerceUser = await getOrCreateEcommerceUserBySessionUserId(session.IdUser);

  const cart = await prisma.cart.findUnique({
    where: { id: body.cartId },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ ok: false, message: "Carrito vacío" }, { status: 404 });
  }
  const guestToken = cookies().get("guest_cart")?.value;
  const isGuestCartAuthorized = Boolean(cart.token && guestToken && cart.token === guestToken);
  const isUserCartAuthorized = Boolean(ecommerceUser?.id && cart.userId === ecommerceUser.id);
  if (!isGuestCartAuthorized && !isUserCartAuthorized) {
    return NextResponse.json({ ok: false, message: "Carrito no autorizado" }, { status: 403 });
  }

  const shippingMethod = body.shippingMethodId
    ? await prisma.shippingMethod.findUnique({ where: { id: body.shippingMethodId } })
    : null;
  if (body.shippingMethodId && (!shippingMethod || !shippingMethod.active)) {
    return NextResponse.json({ ok: false, message: "Método de envío no disponible" }, { status: 404 });
  }

  const lines = cart.items.map((item) => {
    const unitPrice = Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice);
    return {
      productId: item.productId,
      categoryId: item.product.categoryId,
      code: item.variant?.sku ?? item.productId,
      title: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    };
  });
  const subtotal = lines.reduce((acc, item) => acc + item.lineTotal, 0);
  const shippingTotal = Number(shippingMethod?.price ?? 0);
  const discount = await calculateDiscount(body.couponCode, { subtotal, items: lines });
  const grandTotal = Math.max(0, subtotal + shippingTotal - discount.discountTotal);

  if (grandTotal <= 0) {
    return NextResponse.json({ ok: false, message: "El total debe ser mayor a cero" }, { status: 400 });
  }

  // Hosted exige _order_id alfanumérico (sin guiones)
  const reference = `PIX${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: "PENDIENTE",
      userId: ecommerceUser?.id,
      addressId: body.addressId,
      subtotal,
      discountTotal: discount.discountTotal,
      shippingTotal,
      grandTotal,
      couponId: discount.couponId,
      items: {
        create: lines.map((line, index) => ({
          productId: line.productId,
          variantId: cart.items[index].variantId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.lineTotal,
        })),
      },
      history: {
        create: { status: "PENDIENTE", note: "Orden inicializada para pago con PixelPay" },
      },
    },
  });

  const metadata: PaymentMetadata = {
    reference,
    cartId: cart.id,
    userSessionId: session.IdUser,
  };

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PAYMENT_PROVIDER,
      amount: grandTotal,
      currency: PAYMENT_CURRENCY,
      status: "PENDING",
      providerRef: reference,
      rawPayload: JSON.stringify(metadata),
    },
  });

  // PixelPay valida que la suma de los items coincida con _amount. Con envío o cupón no coincide,
  // así que en ese caso se manda un único item con el total de la orden.
  const itemsTotal = Number(subtotal.toFixed(2));
  const items =
    itemsTotal === Number(grandTotal.toFixed(2))
      ? lines.map((line) => ({ code: line.code, title: line.title, price: line.unitPrice, qty: line.quantity }))
      : [{ code: order.orderNumber, title: `Orden ${order.orderNumber}`, price: Number(grandTotal.toFixed(2)), qty: 1 }];

  const hosted = await createHostedPaymentLink({
    request,
    paymentId: payment.id,
    reference,
    amount: grandTotal,
    currency: PAYMENT_CURRENCY,
    items,
    customer: {
      firstName: body.customer?.firstName,
      lastName: body.customer?.lastName,
      email: customerEmail,
      phone: body.customer?.phone,
      address: body.customer?.address,
      city: body.customer?.city,
      state: body.customer?.state,
      country: body.customer?.country,
      zip: body.customer?.zip,
    },
  });

  if (!hosted.ok) {
    await failPixelPayPayment(payment.id, "No se pudo generar el enlace de PixelPay", hosted.diagnostics);
    return NextResponse.json({ ok: false, message: hosted.message }, { status: hosted.status });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { rawPayload: JSON.stringify({ ...metadata, hostedPaymentUrl: hosted.paymentUrl }) },
  });

  return NextResponse.json({ ok: true, paymentId: payment.id, orderId: order.id, paymentUrl: hosted.paymentUrl });
}
