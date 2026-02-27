import { getSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IntervaloPlan } from "@/lib/generated/prisma";
import { NextResponse } from "next/server";
import Settings from "@pixelpay/sdk-core/lib/models/Settings";
import TransactionService from "@pixelpay/sdk-core/lib/services/Transaction";

const PIXELPAY_METHOD_NAME = "PIXELPAY";



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
  [key: string]: unknown;
};

function parseHttpCode(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getPixelPayResponseType(result: PixelPayResult | undefined): string | null {
  if (!result) {
    return null;
  }

  const explicitType = [result.responseType, result.type]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0)
    ?.trim()
    .toLowerCase();

  if (explicitType) {
    return explicitType;
  }

  const httpCode =
    parseHttpCode(result.code) ??
    parseHttpCode(result.statusCode) ??
    parseHttpCode(result.httpCode) ??
    parseHttpCode(result.status);

  if (!httpCode) {
    return null;
  }

  if (httpCode === 200) return "successresponse";
  if (httpCode === 400) return "errorresponse";
  if (httpCode === 401 || httpCode === 403) return "noaccessresponse";
  if (httpCode === 402) return "paymentdeclinedresponse";
  if (httpCode === 404 || httpCode === 405 || httpCode === 406) return "notfoundresponse";
  if (httpCode === 408) return "timeoutresponse";
  if (httpCode === 412 || httpCode === 418) return "preconditionalresponse";
  if (httpCode === 422) return "inputerrorresponse";
  if (httpCode === 500) return "networkfailureresponse";
  if (httpCode > 500) return "failureresponse";

  return null;
}

function isSuccessfulPixelPayResponse(result: PixelPayResult | undefined): boolean {
  const responseType = getPixelPayResponseType(result);

  if (responseType) {
    return responseType === "successresponse";
  }

  if (result?.success === true) {
    return true;
  }

  const status = String(result?.status ?? "").toUpperCase();
  if (status.includes("APPROV") || status.includes("SUCCESS") || status.includes("PAID")) {
    return true;
  }

  const message = String(result?.message ?? "").toLowerCase();
  return message.includes("pagad") || message.includes("aprobad") || message.includes("success");
}
type TransactionServiceInstance = InstanceType<typeof TransactionService> & {
  verifyPaymentHash?: (paymentHash: string, orderId: string, secret: string) => boolean;
};

function verifyPaymentHash(result: { [key: string]: unknown } | undefined, reference: string | undefined): boolean | null {
  const paymentHash = typeof result?.payment_hash === "string" ? result.payment_hash : null;
  if (!paymentHash) {
    return null;
  }

  if (!reference) {
    return false;
  }

  const endpoint = process.env.NEXT_PUBLIC_PIXELPAY_ENDPOINT ?? "";
  const keyId = process.env.PIXELPAY_KEY_ID || process.env.NEXT_PUBLIC_PIXELPAY_KEY_ID || process.env.NEXT_PUBLIC_PIXELPAY_IDKEY || "";
  const keyHash = process.env.PIXELPAY_KEY_HASH || process.env.NEXT_PUBLIC_PIXELPAY_KEY_HASH || process.env.NEXT_PUBLIC_PIXELPAY_SECRET || "";

  if (!keyHash) {
    return false;
  }

  const settings = new Settings();
  settings.setupEndpoint?.(endpoint);
  settings.setupCredentials?.(keyId, keyHash);

  const service = new TransactionService(settings) as TransactionServiceInstance;

  if (typeof service.verifyPaymentHash !== "function") {
    return false;
  }

  return service.verifyPaymentHash(paymentHash, reference, keyHash);
}

function calcularFinMembresia(inicio: Date, intervalo: IntervaloPlan, cantidadIntervalos: number) {
  const fin = new Date(inicio);
  const intervalos = Math.max(cantidadIntervalos, 1);

  if (intervalo === "ANUAL") {
    fin.setFullYear(fin.getFullYear() + intervalos);
    return fin;
  }

  if (intervalo === "UNICO") {
    fin.setDate(fin.getDate() + intervalos);
    return fin;
  }

  fin.setMonth(fin.getMonth() + intervalos);
  return fin;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.IdUser) {
    return NextResponse.json({ ok: false, message: "Sesión inválida" }, { status: 401 });
  }

  const body = (await request.json()) as { planId?: string };

  if (!body.planId) {
    return NextResponse.json({ ok: false, message: "Plan no especificado" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { id: body.planId } });
  if (!plan || !plan.active) {
    return NextResponse.json({ ok: false, message: "Plan no disponible" }, { status: 404 });
  }

  const metodoPago = await prisma.metodoPago.upsert({
    where: { nombre: PIXELPAY_METHOD_NAME },
    update: { activo: true },
    create: {
      nombre: PIXELPAY_METHOD_NAME,
      descripcion: "Pasarela PixelPay",
      activo: true,
      metadatos: { provider: "pixelpay" },
    },
  });

  const orderReference = `PIX-${Date.now()}`;

  const pago = await prisma.pago.create({
    data: {
      usuarioId: session.IdUser,
      montoCentavos: plan.priceCents,
      metodoPagoId: metodoPago.id,
      estado: "PROCESANDO",
      codigoReferencia: orderReference,
      metadatos: {
        provider: "pixelpay",
        planId: plan.id,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    pagoId: pago.id,
    sdkConfig: {
      environment: process.env.NEXT_PUBLIC_PIXELPAY_ENVIRONMENT ?? "sandbox",
      publicKey: process.env.NEXT_PUBLIC_PIXELPAY_PUBLIC_KEY,
    },
    paymentData: {
      amount: plan.priceCents / 100,
      currency: plan.currency,
      reference: orderReference,
      description: `${plan.name} (${plan.interval})`,
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

  const pago = await prisma.pago.findFirst({
    where: {
      id: body.pagoId,
      usuarioId: session.IdUser,
    },
  });

  if (!pago) {
    return NextResponse.json({ ok: false, message: "No se encontró el pago a actualizar" }, { status: 404 });
  }

  if (pago.estado === "EXITOSO" && pago.suscripcionId) {
    return NextResponse.json({ ok: true, suscripcionId: pago.suscripcionId });
  }

  const estadoByResponse = isSuccessfulPixelPayResponse(body.result) ? "EXITOSO" : "FALLIDO";
  const hashIsValid = verifyPaymentHash(body.result, body.reference);
  const hasHashValidationFailure = hashIsValid === false;
  const estado = body.isValidPayment === false || hasHashValidationFailure ? "FALLIDO" : estadoByResponse;
  const metadatosExistentes = (pago.metadatos as Record<string, unknown> | null) ?? {};

  if (estado !== "EXITOSO") {
    await prisma.pago.update({
      where: { id: pago.id },
      data: {
        estado,
        idPagoPasarela: body.result?.id,
        metadatos: {
          ...metadatosExistentes,
          providerResult: body.result ? JSON.parse(JSON.stringify(body.result)) : undefined,
        },
        liquidadoEn: null,
      },
    });

    return NextResponse.json({ ok: true });
  }

  const planId = typeof metadatosExistentes.planId === "string" ? metadatosExistentes.planId : null;
  if (!planId) {
    return NextResponse.json({ ok: false, message: "No se encontró el plan del pago" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ ok: false, message: "El plan asociado al pago no existe" }, { status: 404 });
  }

  const ahora = new Date();
  const finMembresia = calcularFinMembresia(ahora, plan.interval, plan.intervalCount);

  const suscripcionCreada = await prisma.$transaction(async (tx) => {
    await tx.suscripcion.updateMany({
      where: {
        usuarioId: session.IdUser,
        estado: "ACTIVA",
      },
      data: {
        estado: "CANCELADA",
        canceladoEn: ahora,
      },
    });

    const suscripcion = await tx.suscripcion.create({
      data: {
        usuarioId: session.IdUser,
        planId: plan.id,
        estado: "ACTIVA",
        precioCentavos: plan.priceCents,
        intervalo: plan.interval,
        cantidadIntervalos: plan.intervalCount,
        inicioPeriodoActual: ahora,
        finPeriodoActual: finMembresia,
      },
    });

    await tx.pago.update({
      where: { id: pago.id },
      data: {
        estado,
        suscripcionId: suscripcion.id,
        idPagoPasarela: body.result?.id,
        metadatos: {
          ...metadatosExistentes,
          providerResult: body.result ? JSON.parse(JSON.stringify(body.result)) : undefined,
          suscripcionId: suscripcion.id,
        },
        liquidadoEn: ahora,
      },
    });

    const factura = await tx.factura.create({
      data: {
        usuarioId: session.IdUser,
        suscripcionId: suscripcion.id,
        totalCentavos: plan.priceCents,
        emitidaEn: ahora,
        pagadaEn: ahora,
        estado: "PAGADA",
      },
    });

    await tx.itemFactura.create({
      data: {
        facturaId: factura.id,
        descripcion: `${plan.name} (${plan.interval})`,
        montoCentavos: plan.priceCents,
        cantidad: 1,
        metadatos: {
          planId: plan.id,
          intervalo: plan.interval,
          cantidadIntervalos: plan.intervalCount,
        },
      },
    });

    return suscripcion;
  });

  return NextResponse.json({ ok: true, suscripcionId: suscripcionCreada.id });
}
