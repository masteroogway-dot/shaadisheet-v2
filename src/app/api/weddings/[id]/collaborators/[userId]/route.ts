import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/permissions";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: weddingId, userId } = await params;
  const { role } = await req.json();

  if (!["viewer", "editor", "co-owner"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const userRole = await getUserRole(weddingId);
  if (userRole !== "owner" && userRole !== "co-owner") {
    return NextResponse.json({ error: "Only the owner or co-owner can change permissions" }, { status: 403 });
  }

  await prisma.weddingCollaborator.updateMany({
    where: { weddingId, userId },
    data: { role },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: weddingId, userId } = await params;

  const userRole = await getUserRole(weddingId);
  if (userRole !== "owner" && userRole !== "co-owner") {
    return NextResponse.json({ error: "Only the owner or co-owner can remove collaborators" }, { status: 403 });
  }

  await prisma.weddingCollaborator.deleteMany({
    where: { weddingId, userId },
  });

  return NextResponse.json({ success: true });
}
