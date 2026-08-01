import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: weddingId } = await params;
  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get("photoId");
  const size = searchParams.get("size") || "full";

  if (!photoId) {
    return NextResponse.json({ error: "photoId required" }, { status: 400 });
  }

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo || photo.source !== "google") {
    return NextResponse.json({ error: "Not a Google photo" }, { status: 404 });
  }

  const photoDump = await prisma.photoDump.findUnique({ where: { id: photo.photoDumpId } });
  if (!photoDump || photoDump.weddingId !== weddingId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let width: string;
  let height: string;
  switch (size) {
    case "thumb":
      width = "400";
      height = "300";
      break;
    case "medium":
      width = "800";
      height = "600";
      break;
    default:
      width = "1920";
      height = "1080";
  }

  const googleUrl = `${photo.url}=w${width}-h${height}-c`;

  try {
    const imageRes = await fetch(googleUrl);
    if (!imageRes.ok) {
      return NextResponse.json({ error: "Failed to fetch from Google" }, { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
