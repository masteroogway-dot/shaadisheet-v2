import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
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

    let photoDump = await prisma.photoDump.findUnique({
      where: { weddingId },
      include: {
        photos: { orderBy: { order: "asc" } },
      },
    });

    if (!photoDump) {
      photoDump = await prisma.photoDump.create({
        data: {
          weddingId,
          shareToken: require("crypto").randomBytes(16).toString("base64url").substring(0, 22),
        },
        include: { photos: { orderBy: { order: "asc" } } },
      });
    }

    return NextResponse.json(photoDump);
  } catch (error: any) {
    console.error("Get photos error:", error);
    return NextResponse.json({ error: error.message || "Failed to load photos" }, { status: 500 });
  }
}
