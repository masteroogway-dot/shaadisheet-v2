import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: weddingId } = await params;

  const role = await getUserRole(weddingId);
  if (!role) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const collaborators = await prisma.weddingCollaborator.findMany({
    where: { weddingId, status: "accepted" },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ collaborators });
}
