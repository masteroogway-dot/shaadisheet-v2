import { NextRequest, NextResponse } from "next/server";
import { getPhotoDumpByToken } from "@/lib/photodump";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const photoDump = await getPhotoDumpByToken(token);

    if (!photoDump) {
      return NextResponse.json({ error: "Gallery not found or not published" }, { status: 404 });
    }

    return NextResponse.json({
      title: photoDump.title,
      description: photoDump.description,
      coverUrl: photoDump.coverUrl,
      wedding: photoDump.wedding,
      photos: photoDump.photos.map((p) => ({
        id: p.id,
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        filename: p.filename,
        width: p.width,
        height: p.height,
        favorite: p.favorite,
        tags: p.tags,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
