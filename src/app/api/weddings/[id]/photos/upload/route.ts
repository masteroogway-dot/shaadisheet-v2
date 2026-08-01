import { NextRequest, NextResponse } from "next/server";
import { getOrCreatePhotoDump, uploadPhotos, publishPhotoDump, regenerateShareToken, updatePhotoDumpSettings, tagPhotos } from "@/lib/photodump";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const weddingId = formData.get("weddingId") as string;

    if (!weddingId) {
      return NextResponse.json({ error: "Wedding ID required" }, { status: 400 });
    }

    const files: Array<{ buffer: string; filename: string; mime: string }> = [];
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        files.push({
          buffer: base64,
          filename: value.name,
          mime: value.type || "image/jpeg",
        });
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const result = await uploadPhotos(weddingId, files);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, weddingId } = body;

    // Extract weddingId from URL if not in body
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const idFromUrl = pathParts[3]; // /api/weddings/[id]/photos/upload
    const wid = weddingId || idFromUrl;

    if (!wid) {
      return NextResponse.json({ error: "Wedding ID required" }, { status: 400 });
    }

    switch (action) {
      case "publish": {
        const result = await publishPhotoDump(wid, body.publish);
        return NextResponse.json(result);
      }
      case "regenerate": {
        const result = await regenerateShareToken(wid);
        return NextResponse.json(result);
      }
      case "updateSettings": {
        const result = await updatePhotoDumpSettings(wid, {
          title: body.title,
          description: body.description,
        });
        return NextResponse.json(result);
      }
      case "tag": {
        const result = await tagPhotos(body.photoIds, body.tag);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
