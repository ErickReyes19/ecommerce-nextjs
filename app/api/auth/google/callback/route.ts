export const dynamic = 'force-dynamic';
import { exchangeCodeForGoogleProfile, getOrCreateGoogleSessionToken } from "@/lib/google-oauth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  console.log("🚀 ~ GET ~ origin:", origin)
  console.log("NODE_ENV:", process.env.NODE_ENV);

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) return NextResponse.redirect(`${origin}/login?error=google_missing_params`);

    const cookieHeader = request.headers.get("cookie") ?? "";
    const stateCookie = cookieHeader
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("google_oauth_state="))
      ?.split("=")[1];

    if (!stateCookie || stateCookie !== state) {
      return NextResponse.redirect(`${origin}/login?error=google_state_invalid`);
    }

    const profile = await exchangeCodeForGoogleProfile(code, origin);
    const sessionToken = await getOrCreateGoogleSessionToken(profile);

    const response = NextResponse.redirect(`${origin}/mi-perfil`);
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 21600,
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.set("google_oauth_state", "", { path: "/", maxAge: 0 });

    return response;
  } catch(error) {
    console.error("🔥 GOOGLE AUTH ERROR:", error);
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }
}
