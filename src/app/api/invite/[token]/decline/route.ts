import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.weddingInvite.findUnique({
    where: { token },
  });

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.status !== "pending") return NextResponse.json({ error: "Invite already " + invite.status }, { status: 400 });

  await prisma.weddingInvite.update({
    where: { id: invite.id },
    data: { status: "declined" },
  });

  return NextResponse.json({ success: true });
}
