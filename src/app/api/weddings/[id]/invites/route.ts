import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: weddingId } = await params;
  const { role = "viewer" } = await req.json();

  if (!["viewer", "editor", "co-owner"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await prisma.weddingInvite.create({
    data: {
      weddingId,
      inviterId: session.user.id,
      token,
      role,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "https://shaadisheet-v2.vercel.app";
  const link = `${baseUrl}/invite/${token}`;

  return NextResponse.json({ invite, link, token });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: weddingId } = await params;

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invites = await prisma.weddingInvite.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invites });
}
