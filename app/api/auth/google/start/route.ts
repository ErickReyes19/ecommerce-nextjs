import { buildGoogleAuthorizationUrl } from "@/lib/google-oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const state = crypto.randomUUID();
  const redirectUrl = buildGoogleAuthorizationUrl(state, origin);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
