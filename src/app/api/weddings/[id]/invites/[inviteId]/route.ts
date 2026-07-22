import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; inviteId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: weddingId, inviteId } = await params;

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weddingInvite.deleteMany({
    where: { id: inviteId, weddingId },
  });

  return NextResponse.json({ success: true });
}
