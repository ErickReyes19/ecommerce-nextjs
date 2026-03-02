import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Bucket = {
  count: number;
  reset: number;
};

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  limit: 120,
  windowMs: 60_000,
};

const ROUTE_RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/auth": { limit: 20, windowMs: 60_000 },
  "/api": { limit: 80, windowMs: 60_000 },
  "/checkout": { limit: 50, windowMs: 60_000 },
  "/protected": { limit: 90, windowMs: 60_000 },
};

const rateMap = new Map<string, Bucket>();

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  return req.ip ?? firstForwardedIp ?? "unknown";
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
  for (const [prefix, config] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      return config;
    }
  }

  return DEFAULT_RATE_LIMIT;
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
  if (rateMap.size < 5_000) return;

  for (const [key, bucket] of rateMap.entries()) {
    if (bucket.reset <= now) {
      rateMap.delete(key);
    }
  }
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!shouldSkipRateLimit(path)) {
    const clientIp = getClientIp(req);
    const config = getRateLimitConfig(path);
    const identifier = `${clientIp}:${path.split("/")[1] || "root"}`;

    cleanupExpiredEntries(Date.now());

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
