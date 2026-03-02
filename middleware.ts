/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Bucket = { count: number; reset: number };
type RateLimitConfig = { limit: number; windowMs: number };

const DEFAULT_RATE_LIMIT: RateLimitConfig = { limit: 120, windowMs: 60_000 };

const ROUTE_RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/auth": { limit: 20, windowMs: 60_000 },
  "/api": { limit: 80, windowMs: 60_000 },
  "/checkout": { limit: 50, windowMs: 60_000 },
  "/protected": { limit: 50, windowMs: 60_000 },
  "/public": { limit: 50, windowMs: 60_000 },
};

// Persist map in globalThis so it survives hot-reloads in dev (per instancia)
const rateMap: Map<string, Bucket> =
  // @ts-ignore
  globalThis.__RATE_LIMIT_MAP ?? new Map();
// @ts-ignore
if (!globalThis.__RATE_LIMIT_MAP) globalThis.__RATE_LIMIT_MAP = rateMap;

function getClientIp(req: NextRequest): string {
  // Prefer common headers set by proxies / CDNs
  const header = req.headers;
  const xff = header.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xReal = header.get("x-real-ip");
  if (xReal) return xReal;
  const cf = header.get("cf-connecting-ip");
  if (cf) return cf;
  const vercel = header.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim();
  // last resort: localhost during dev may not set any of the above
  return "unknown";
}

// Devuelve tanto la config como el prefix que matchea
function getRateLimitConfigWithPrefix(pathname: string): { prefix: string; config: RateLimitConfig } {
  for (const [prefix, config] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return { prefix, config };
  }
  return { prefix: "default", config: DEFAULT_RATE_LIMIT };
}

function shouldSkipRateLimit(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads")
  );
}

function isRateLimited(key: string, config: RateLimitConfig) {
  const now = Date.now();
  const current = rateMap.get(key);

  if (!current || current.reset <= now) {
    rateMap.set(key, { count: 1, reset: now + config.windowMs });
    return { limited: false, retryAfter: 0 };
  }

  current.count += 1;

  if (current.count > config.limit) {
    const retryAfterSeconds = Math.ceil((current.reset - now) / 1000);
    return { limited: true, retryAfter: Math.max(retryAfterSeconds, 1) };
  }

  return { limited: false, retryAfter: 0 };
}

function cleanupExpiredEntries(now: number) {
  // Mantén simple: borra expirados cada request (map pequeño durante pruebas)
  rateMap.forEach((bucket, key) => {
    if (bucket.reset <= now) rateMap.delete(key);
  });
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!shouldSkipRateLimit(path)) {
    const clientIp = getClientIp(req);
    const { prefix, config } = getRateLimitConfigWithPrefix(path);

    // Usa ip + prefix para agrupar por tipo de ruta (ej: /api/auth vs /api)
    const identifier = `${clientIp}:${prefix}`;

    cleanupExpiredEntries(Date.now());

    // logs para debugging — elimina en prod
    console.log("[rate-limit] id=", identifier, "mapSize=", rateMap.size);

    const { limited, retryAfter } = isRateLimited(identifier, config);
    if (limited) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Has excedido el límite de solicitudes. Intenta nuevamente en unos segundos.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(config.limit),
          },
        },
      );
    }
  }

  const sessionCookie =
    req.cookies.get("next-auth.session-token") ??
    req.cookies.get("__Secure-next-auth.session-token") ??
    req.cookies.get("session");

  if ((path.startsWith("/checkout") || path.startsWith("/protected")) && !sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/protected") && req.cookies.get("role")?.value !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*", "/checkout/:path*", "/api/:path*"],
};