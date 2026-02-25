import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Settings from "@pixelpay/sdk-core/lib/models/Settings";
import TransactionService from "@pixelpay/sdk-core/lib/services/Transaction";
import { getOrCreateEcommerceUserBySessionUserId } from "@/src/lib/ecommerce-user";

const PAYMENT_PROVIDER = "PIXELPAY";
const PAYMENT_CURRENCY = "HNL";

type PixelPayResult = {
  id?: string;
  status?: number | string;
  success?: boolean;
  message?: string;
  code?: number | string;
  statusCode?: number | string;
  httpCode?: number | string;
  responseType?: string;
  type?: string;
  payment_hash?: string;
  data?: {
    response_approved?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type PaymentMetadata = {
  reference: string;
  cartId?: string;
  userSessionId: string;
  providerResult?: PixelPayResult;
};

type CouponContext = {
  subtotal: number;
  items: Array<{ productId: string; categoryId: string | null; lineTotal: number }>;
};

function parseHttpCode(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isSuccessfulPixelPayResponse(result: PixelPayResult | undefined): boolean {
  const httpCode =
    parseHttpCode(result?.httpCode) ??
    parseHttpCode(result?.statusCode) ??
    parseHttpCode(result?.code) ??
    parseHttpCode(result?.status);

  if (httpCode && (httpCode < 200 || httpCode > 299)) {
    return false;
  }

  if (result?.success === true && result?.data?.response_approved === true) {
    return true;
  }

  const status = String(result?.status ?? "").toUpperCase();
  const message = String(result?.message ?? "").toUpperCase();
  return status.includes("APPROV") || status.includes("PAID") || message.includes("APPROV");
}

type TransactionServiceInstance = InstanceType<typeof TransactionService> & {
  verifyPaymentHash?: (paymentHash: string, orderId: string, secret: string) => boolean;
};

function verifyPaymentHash(result: PixelPayResult | undefined, reference: string | undefined): boolean | null {
  const paymentHash = typeof result?.payment_hash === "string" ? result.payment_hash : null;
  if (!paymentHash) return null;
  if (!reference) return false;

  const endpoint = process.env.NEXT_PUBLIC_PIXELPAY_ENDPOINT ?? "";
  const keyId = process.env.PIXELPAY_KEY_ID || process.env.NEXT_PUBLIC_PIXELPAY_KEY_ID || "";
  const keyHash = process.env.PIXELPAY_KEY_HASH || process.env.NEXT_PUBLIC_PIXELPAY_KEY_HASH || "";
  if (!keyHash) return false;

  const settings = new Settings();
  settings.setupEndpoint?.(endpoint);
  settings.setupCredentials?.(keyId, keyHash);

  const service = new TransactionService(settings) as TransactionServiceInstance;
  if (typeof service.verifyPaymentHash !== "function") return false;
  return service.verifyPaymentHash(paymentHash, reference, keyHash);
}

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

  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId") ?? "";
  const shippingMethodId = searchParams.get("shippingMethodId") ?? "";
  const couponCode = searchParams.get("couponCode") ?? undefined;

  if (!cartId || !shippingMethodId) {
    return NextResponse.json({ ok: false, message: "Faltan datos para calcular totales" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: { select: { basePrice: true, categoryId: true } }, variant: true } } },
  });

  const shippingMethod = await prisma.shippingMethod.findUnique({ where: { id: shippingMethodId } });
  if (!cart || !shippingMethod || !shippingMethod.active) {
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
  const shippingTotal = Number(shippingMethod.price);
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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) {
    return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
  }

  const body = (await request.json()) as {
    cartId?: string;
    shippingMethodId?: string;
    addressId?: string;
    shippingPrice?: number;
    couponCode?: string;
  };

  if (!body.cartId || !body.shippingMethodId) {
    return NextResponse.json({ ok: false, message: "Faltan datos para inicializar checkout" }, { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: { id: body.cartId },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ ok: false, message: "Carrito vacío" }, { status: 404 });
  }
  const guestToken = cookies().get("guest_cart")?.value;
  if (cart.token && guestToken && cart.token !== guestToken) {
    return NextResponse.json({ ok: false, message: "Carrito no autorizado" }, { status: 403 });
  }

  const shippingMethod = await prisma.shippingMethod.findUnique({ where: { id: body.shippingMethodId } });
  if (!shippingMethod || !shippingMethod.active) {
    return NextResponse.json({ ok: false, message: "Método de envío no disponible" }, { status: 404 });
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
  const shippingTotal = Number(shippingMethod.price);
  const discount = await calculateDiscount(body.couponCode, { subtotal, items: lines });
  const grandTotal = Math.max(0, subtotal + shippingTotal - discount.discountTotal);

  const reference = `PIX-${Date.now()}`;
  const ecommerceUser = await getOrCreateEcommerceUserBySessionUserId(session.IdUser);

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
        create: cart.items.map((item) => {
          const unitPrice = Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice);
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          };
        }),
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

  return NextResponse.json({
    ok: true,
    pagoId: payment.id,
    orderId: order.id,
    paymentData: {
      amount: grandTotal,
      currency: PAYMENT_CURRENCY,
      reference,
      description: `Orden ${order.orderNumber}`,
    },
  });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) {
    return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
  }

  const body = (await request.json()) as {
    pagoId?: string;
    result?: PixelPayResult;
    isValidPayment?: boolean;
    reference?: string;
  };

  if (!body.pagoId) {
    return NextResponse.json({ ok: false, message: "Pago no especificado" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: body.pagoId },
    include: { order: true },
  });

  if (!payment) {
    return NextResponse.json({ ok: false, message: "Pago no encontrado" }, { status: 404 });
  }

  const metadata = payment.rawPayload ? (JSON.parse(payment.rawPayload) as PaymentMetadata) : null;
  if (!metadata || metadata.userSessionId !== session.IdUser) {
    return NextResponse.json({ ok: false, message: "No autorizado para operar este pago" }, { status: 403 });
  }

  if (payment.status === "PAID") {
    return NextResponse.json({ ok: true, orderId: payment.orderId });
  }

  const hashIsValid = verifyPaymentHash(body.result, body.reference);
  const approvedByProvider = isSuccessfulPixelPayResponse(body.result);
  const isValidPayment = body.isValidPayment !== false && hashIsValid !== false && approvedByProvider;

  if (!isValidPayment) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          rawPayload: JSON.stringify({
            ...metadata,
            providerResult: body.result,
          }),
        },
      }),
      prisma.orderHistory.create({
        data: {
          orderId: payment.orderId,
          status: "CANCELADO",
          note: "Pago rechazado por PixelPay",
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CANCELADO" },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Pago rechazado" });
  }

  const referenceDoesNotMatch = Boolean(body.reference && body.reference !== metadata.reference);
  if (referenceDoesNotMatch) {
    return NextResponse.json({ ok: false, message: "Referencia de pago inválida" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const orderItems = await tx.orderItem.findMany({ where: { orderId: payment.orderId } });

    for (const item of orderItems) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerRef: body.reference ?? metadata.reference,
        rawPayload: JSON.stringify({
          ...metadata,
          providerResult: body.result,
        }),
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAGADO" },
    });

    await tx.orderHistory.create({
      data: {
        orderId: payment.orderId,
        status: "PAGADO",
        note: "Pago aprobado con PixelPay",
      },
    });

    if (metadata.cartId) {
      await tx.cartItem.deleteMany({ where: { cartId: metadata.cartId } });
    }
  });

  return NextResponse.json({ ok: true, orderId: payment.orderId });
}
