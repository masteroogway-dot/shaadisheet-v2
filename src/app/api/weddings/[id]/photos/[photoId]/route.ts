import { NextRequest, NextResponse } from "next/server";
import { togglePhotoFavorite, deletePhoto } from "@/lib/photodump";

export async function PATCH(req: NextRequest) {
  try {
    const { photoId } = await req.json();
    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }
    const photo = await togglePhotoFavorite(photoId);
    return NextResponse.json(photo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { photoId } = await req.json();
    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }
    const result = await deletePhoto(photoId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
