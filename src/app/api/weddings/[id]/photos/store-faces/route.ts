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

    const { faces } = await req.json();

    if (!faces || !Array.isArray(faces)) {
      return NextResponse.json({ error: "Faces array required" }, { status: 400 });
    }

    let stored = 0;
    for (const face of faces) {
      const { photoId, x, y, w, h, embedding } = face;
      if (!photoId || !embedding) continue;

      await prisma.faceEmbedding.create({
        data: {
          photoId,
          x: x || 0,
          y: y || 0,
          w: w || 0,
          h: h || 0,
          embedding: JSON.stringify(embedding),
        },
      });

      await prisma.photo.update({
        where: { id: photoId },
        data: { facesProcessed: true },
      });

      stored++;
    }

    return NextResponse.json({ stored, total: faces.length });
  } catch (error: any) {
    console.error("Store faces error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
