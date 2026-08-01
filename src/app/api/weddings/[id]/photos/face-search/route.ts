import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: weddingId } = await params;
    const { searchParams } = new URL(req.url);
    const label = searchParams.get("label");

    if (!label) {
      return NextResponse.json({ error: "Label required" }, { status: 400 });
    }

    const photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
    if (!photoDump) {
      return NextResponse.json({ error: "Photo dump not found" }, { status: 404 });
    }

    const labeledFaces = await prisma.faceEmbedding.findMany({
      where: {
        label: { contains: label, mode: "insensitive" },
      },
      include: { photo: true },
    });

    const photoIds = [...new Set(labeledFaces.map((f: any) => f.photoId))];

    const photos = await prisma.photo.findMany({
      where: {
        id: { in: photoIds },
        photoDumpId: photoDump.id,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      query: label,
      matchCount: photos.length,
      photos: photos.map((p: any) => ({
        id: p.id,
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        filename: p.filename,
        width: p.width,
        height: p.height,
        favorite: p.favorite,
        createdAt: p.createdAt,
      })),
      faces: labeledFaces.map((f: any) => ({
        photoId: f.photoId,
        label: f.label,
        x: f.x,
        y: f.y,
        w: f.w,
        h: f.h,
      })),
    });
  } catch (error: any) {
    console.error("Face search error:", error);
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
