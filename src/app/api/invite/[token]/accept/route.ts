import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const rl = rateLimit(`invite:${session.user.id}`, 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many attempts. Try again in a moment." }, { status: 429 });

  const { token } = await params;

  const invite = await prisma.weddingInvite.findUnique({
    where: { token },
  });

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.status !== "pending") return NextResponse.json({ error: "Invite already " + invite.status }, { status: 400 });
  if (new Date() > invite.expiresAt) return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  if (invite.inviterId === session.user.id) return NextResponse.json({ error: "Cannot accept your own invite" }, { status: 400 });

  const existing = await prisma.weddingCollaborator.findFirst({
    where: { weddingId: invite.weddingId, userId: session.user.id },
  });

  if (existing) {
    await prisma.weddingCollaborator.update({
      where: { id: existing.id },
      data: { role: invite.role, status: "accepted" },
    });
  } else {
    await prisma.weddingCollaborator.create({
      data: {
        weddingId: invite.weddingId,
        userId: session.user.id,
        role: invite.role,
        invitedBy: invite.inviterId,
        status: "accepted",
      },
    });
  }

  await prisma.weddingInvite.update({
    where: { id: invite.id },
    data: { status: "accepted" },
  });

  return NextResponse.json({ success: true, weddingId: invite.weddingId });
}
