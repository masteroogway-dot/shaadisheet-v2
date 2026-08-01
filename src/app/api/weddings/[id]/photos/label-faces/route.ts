import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: weddingId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wedding = await prisma.wedding.findFirst({
      where: { id: weddingId, userId: session.user.id },
    });
    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 });
    }

    const { faceIds, label } = await req.json();

    if (!faceIds || !Array.isArray(faceIds) || faceIds.length === 0) {
      return NextResponse.json({ error: "Face IDs required" }, { status: 400 });
    }

    if (!label || label.trim() === "") {
      return NextResponse.json({ error: "Label required" }, { status: 400 });
    }

    await prisma.faceEmbedding.updateMany({
      where: { id: { in: faceIds } },
      data: { label: label.trim() },
    });

    return NextResponse.json({ success: true, labeled: faceIds.length });
  } catch (error: any) {
    console.error("Label faces error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
