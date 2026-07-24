import { NextRequest, NextResponse } from "next/server";
import { getWeddingByRsvpToken, submitRsvp } from "@/lib/actions";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const wedding = await getWeddingByRsvpToken(token);
  if (!wedding) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

  return NextResponse.json({ wedding });
}

export async function POST(req: NextRequest) {
  const { token, guestId, rsvp, dietary } = await req.json();
  if (!token || !guestId || !rsvp) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await submitRsvp(token, guestId, rsvp, dietary);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to submit" }, { status: 400 });
  }
}
