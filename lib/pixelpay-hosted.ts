import crypto from "crypto";

export function getPixelPayEndpoint() {
  const raw = (process.env.PIXELPAY_ENDPOINT || "").trim().replace(/\/$/, "");
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

const keyId = () => process.env.PIXELPAY_KEY_ID || "";
const secretKey = () => process.env.PIXELPAY_SECRET_KEY || "";
const hashSecret = () => process.env.PIXELPAY_PAYMENT_HASH_SECRET || secretKey();

export function getPixelPayConfigError() {
  if (!getPixelPayEndpoint()) return "Falta PIXELPAY_ENDPOINT.";
  if (!keyId()) return "Falta PIXELPAY_KEY_ID.";
  if (!secretKey()) return "Falta PIXELPAY_SECRET_KEY (Secret Key real, no el Key Hash).";
  return null;
}

export function getAppBaseUrl(request: Request) {
  return (process.env.APP_URL || process.env.NEXTAUTH_URL || new URL(request.url).origin).trim().replace(/\/+$/, "");
}

export function createClientSignature(orderId: string) {
  return crypto
    .createHmac("sha3-512", secretKey())
    .update([keyId(), orderId, getPixelPayEndpoint()].join("|"))
    .digest("hex");
}

export function verifyPaymentHash(orderId: string, paymentHash?: string | null) {
  if (!paymentHash || !orderId || !keyId() || !hashSecret()) return false;
  const local = crypto.createHash("md5").update([orderId, keyId(), hashSecret()].join("|")).digest("hex");
  if (local.length !== paymentHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(local), Buffer.from(paymentHash));
}

function getHostedPath() {
  const env = (process.env.PIXELPAY_ENVIRONMENT || "sandbox").toLowerCase();
  return env === "production" || env === "live"
    ? "/api/v2/transaction/hosted/other"
    : "/api/v2/transaction/hosted/sandbox";
}

type HostedResponse = {
  success?: boolean | string | number;
  url?: string;
  payment_url?: string;
  checkout_url?: string;
  redirect_url?: string;
  data?: HostedResponse;
  result?: HostedResponse;
  errors?: Record<string, string[]>;
  message?: string;
};

function findPaymentUrl(response: HostedResponse | null | undefined): string | null {
  if (!response) return null;
  const direct = response.url || response.payment_url || response.checkout_url || response.redirect_url;
  if (typeof direct === "string" && /^https?:\/\//i.test(direct.trim())) return direct.trim();
  return findPaymentUrl(response.data) || findPaymentUrl(response.result);
}

const truncate = (value: string, max: number) => (value.length > max ? value.slice(0, max) : value);
const clean = (value?: string | null) => (value || "").trim().replace(/\s+/g, " ");

export type HostedLinkInput = {
  request: Request;
  paymentId: string;
  reference: string; // alfanumérico
  amount: number; // en lempiras, ej. 1234.5
  currency: string;
  items: Array<{ code: string; title: string; price: number; qty: number }>;
  customer: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
};

export type HostedLinkResult =
  | { ok: true; paymentUrl: string }
  | { ok: false; status: number; message: string; diagnostics?: unknown };

export async function createHostedPaymentLink(input: HostedLinkInput): Promise<HostedLinkResult> {
  const configError = getPixelPayConfigError();
  if (configError) return { ok: false, status: 500, message: configError };

  const base = getAppBaseUrl(input.request);
  const query = `paymentId=${encodeURIComponent(input.paymentId)}`;
  const completeUrl = `${base}/api/pixelpay/hosted/complete?${query}`;
  const cancelUrl = `${base}/api/pixelpay/hosted/cancel?${query}`;
  const callbackUrl = `${base}/api/pixelpay/hosted/callback`;

  const baseUrl = new URL(base);
  if (baseUrl.protocol !== "https:" || ["localhost", "127.0.0.1", "0.0.0.0"].includes(baseUrl.hostname)) {
    return { ok: false, status: 400, message: "APP_URL debe ser un dominio público HTTPS (usa un túnel en local)." };
  }

  const signature = createClientSignature(input.reference);
  const firstName = clean(input.customer.firstName);
  const lastName = clean(input.customer.lastName);

  const orderContent = input.items.map((item) => ({
    code: truncate(item.code, 60),
    title: truncate(item.title, 60),
    description: "",
    tax: 0,
    price: item.price,
    qty: item.qty,
    total: Number((item.price * item.qty).toFixed(2)),
  }));

  const params = new URLSearchParams({
    _key: keyId(),
    _client_signature: signature,
    _callback: callbackUrl,
    _cancel: cancelUrl,
    _complete: completeUrl,
    _order_id: input.reference,
    _order_content: Buffer.from(JSON.stringify(orderContent)).toString("base64"),
    _currency: input.currency,
    _amount: input.amount.toFixed(2),
    _first_name: truncate(firstName.length >= 3 ? firstName : "Cliente", 120),
    _last_name: truncate(lastName.length >= 2 ? lastName : "Web", 120),
    _email: input.customer.email,
    json: "true",
  });

  const optional = (key: string, value?: string, min = 1, max = 120) => {
    const cleaned = clean(value);
    if (cleaned.length >= min) params.set(key, truncate(cleaned, max));
  };
  optional("_address", input.customer.address);
  optional("_city", input.customer.city, 3);
  optional("_state", input.customer.state, 3);
  optional("_country", input.customer.country, 2);
  optional("_zip", input.customer.zip, 1, 20);
  optional("_phone", input.customer.phone, 8, 20);

  const accessToken = process.env.PIXELPAY_ACCESS_TOKEN?.trim();
  let response: Response;
  try {
    response = await fetch(new URL(getHostedPath(), getPixelPayEndpoint()), {
      method: "POST",
      headers: {
        ...(accessToken ? { "x-gw-access-token": accessToken } : {}),
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "es-HN,es;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        Origin: base,
        Referer: `${base}/`,
        "User-Agent":
          process.env.PIXELPAY_USER_AGENT ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "x-client-signature": signature,
      },
      body: params.toString(),
      cache: "no-store",
    });
  } catch (error) {
    return { ok: false, status: 502, message: "No se pudo conectar con PixelPay.", diagnostics: { error: String(error) } };
  }

  const raw = await response.text();
  let data: HostedResponse | null = null;
  try {
    data = raw ? (JSON.parse(raw) as HostedResponse) : null;
  } catch {
    // PixelPay (o Cloudflare) devolvió HTML
  }

  const paymentUrl = findPaymentUrl(data);
  const explicitFail = [false, 0, "0", "false"].includes(data?.success as never);
  const blocked = Boolean(response.headers.get("cf-ray")) && !data;
  const diagnostics = {
    httpStatus: response.status,
    success: data?.success,
    message: data?.message,
    errors: data?.errors,
    hasPaymentUrl: Boolean(paymentUrl),
    blockedByFirewall: blocked,
  };

  if (!response.ok || !paymentUrl || explicitFail) {
    console.error("[PixelPay Hosted] no se obtuvo URL de pago", diagnostics);
    return {
      ok: false,
      status: blocked || response.status >= 500 ? 502 : 400,
      message: blocked
        ? "PixelPay bloqueó la solicitud (Cloudflare). Configura PIXELPAY_ACCESS_TOKEN o pide autorizar la IP del servidor."
        : data?.message || "PixelPay no devolvió URL de pago.",
      diagnostics,
    };
  }

  return { ok: true, paymentUrl };
}
