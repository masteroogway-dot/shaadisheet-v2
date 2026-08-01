import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { photoId } = await req.json();

    const photoDump = await prisma.photoDump.findUnique({
      where: { shareToken: token },
    });
    if (!photoDump || !photoDump.isPublished) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo || photo.photoDumpId !== photoDump.id) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const updated = await prisma.photo.update({
      where: { id: photoId },
      data: { favorite: !photo.favorite },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
