import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.weddingInvite.findUnique({
    where: { token },
    include: {
      wedding: { select: { id: true, name: true, religion: true, weddingDate: true, weddingCity: true } },
      inviter: { select: { id: true, name: true, email: true } },
    },
  });

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.status !== "pending") return NextResponse.json({ error: "Invite already " + invite.status }, { status: 400 });
  if (new Date() > invite.expiresAt) return NextResponse.json({ error: "Invite expired" }, { status: 400 });

  return NextResponse.json({ invite });
}
