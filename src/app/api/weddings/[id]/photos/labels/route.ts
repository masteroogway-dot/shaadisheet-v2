import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: weddingId } = await params;

    const photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
    if (!photoDump) {
      return NextResponse.json({ labels: [] });
    }

    const labeledFaces = await prisma.faceEmbedding.findMany({
      where: {
        label: { not: "" },
      },
      select: { label: true },
      distinct: ["label"],
    });

    const labels = [...new Set(labeledFaces.map((f) => f.label))].sort();

    return NextResponse.json({ labels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
