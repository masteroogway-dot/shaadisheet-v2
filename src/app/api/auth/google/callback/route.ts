import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = "https://www.shaadisheet.com/api/auth/google/callback";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard?google=error&msg=${error}`, req.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard?google=error&msg=missing_params", req.url));
  }

  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64").toString());
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(new URL("/dashboard?google=error&msg=invalid_state", req.url));
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/dashboard?google=error&msg=not_configured", req.url));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.access_token) {
      console.error("Google token error:", tokens);
      return NextResponse.redirect(new URL("/dashboard?google=error&msg=token_failed", req.url));
    }

    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    await prisma.googleToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        scope: tokens.scope || "",
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
        expiresAt,
        scope: tokens.scope || "",
      },
    });

    return NextResponse.redirect(new URL("/dashboard?google=connected", req.url));
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL(`/dashboard?google=error&msg=${err.message}`, req.url));
  }
}
