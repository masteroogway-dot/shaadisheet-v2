import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const weddings = await prisma.wedding.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      religion: true,
      weddingDate: true,
      budget: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      _count: { select: { guests: true, vendors: true, tasks: true } },
    },
  });

  return NextResponse.json(weddings);
}
