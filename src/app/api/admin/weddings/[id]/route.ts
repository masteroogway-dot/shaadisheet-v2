import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  const wedding = await prisma.wedding.findUnique({ where: { id } });
  if (!wedding) return NextResponse.json({ error: "Wedding not found" }, { status: 404 });

  await prisma.wedding.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
