import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { reason } = await request.json();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.role === "admin") return NextResponse.json({ error: "Cannot ban admin" }, { status: 400 });

  await prisma.user.update({
    where: { id },
    data: { role: "banned", bannedAt: new Date(), bannedReason: reason || null },
  });

  return NextResponse.json({ success: true });
}
