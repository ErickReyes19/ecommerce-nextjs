import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 80;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateMap.get(ip);
  if (!current || current.reset < now) {
    rateMap.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

export function middleware(req: NextRequest) {
  const ip = req.ip ?? req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const path = req.nextUrl.pathname;
  const sessionCookie = req.cookies.get("next-auth.session-token") ?? req.cookies.get("__Secure-next-auth.session-token") ?? req.cookies.get("session");

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
