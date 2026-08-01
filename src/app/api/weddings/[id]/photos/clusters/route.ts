import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: weddingId } = await params;

    const photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
    if (!photoDump) {
      return NextResponse.json({ clusters: [] });
    }

    const faces = await prisma.faceEmbedding.findMany({
      where: {
        photo: { photoDumpId: photoDump.id },
      },
      include: { photo: { select: { url: true, thumbnailUrl: true, id: true } } },
    });

    if (faces.length === 0) {
      return NextResponse.json({ clusters: [] });
    }

    const THRESHOLD = 0.72;
    const clusters: Array<{ id: string; label: string; faces: any[] }> = [];
    const assigned = new Set<string>();

    for (const face of faces) {
      if (assigned.has(face.id)) continue;

      const embedding = JSON.parse(face.embedding || "[]") as number[];
      if (embedding.length === 0) continue;

      const cluster = [face];
      assigned.add(face.id);

      for (const other of faces) {
        if (assigned.has(other.id)) continue;

        if (other.photoId === face.photoId) continue;

        const otherEmbedding = JSON.parse(other.embedding || "[]") as number[];
        if (otherEmbedding.length === 0) continue;

        const sim = cosineSimilarity(embedding, otherEmbedding);
        if (sim >= THRESHOLD) {
          cluster.push(other);
          assigned.add(other.id);
        }
      }

      const labeled = cluster.find((f) => f.label);
      clusters.push({
        id: `cluster-${clusters.length}`,
        label: labeled?.label || "",
        faces: cluster.map((f) => ({
          id: f.id,
          photoId: f.photoId,
          photoUrl: f.photo.thumbnailUrl || f.photo.url,
          x: f.x,
          y: f.y,
          w: f.w,
          h: f.h,
          label: f.label,
        })),
      });
    }

    clusters.sort((a, b) => {
      if (a.label && !b.label) return -1;
      if (!a.label && b.label) return 1;
      return b.faces.length - a.faces.length;
    });

    return NextResponse.json({ clusters, totalFaces: faces.length });
  } catch (error: any) {
    console.error("Cluster error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
