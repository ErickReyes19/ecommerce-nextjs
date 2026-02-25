import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Settings from "@pixelpay/sdk-core/lib/models/Settings";
import TransactionService from "@pixelpay/sdk-core/lib/services/Transaction";

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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) {
    return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
  }

  const body = (await request.json()) as {
    cartId?: string;
    shippingMethodId?: string;
    addressId?: string;
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

  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.variant?.salePrice ?? item.variant?.price ?? item.product.basePrice) * item.quantity,
    0,
  );
  const shippingTotal = Number(shippingMethod.price);
  const grandTotal = subtotal + shippingTotal;

  const reference = `PIX-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      status: "PENDIENTE",
      addressId: body.addressId,
      subtotal,
      shippingTotal,
      grandTotal,
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
