import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

async function refreshAccessToken(userId: string): Promise<string | null> {
  const tokenData = await prisma.googleToken.findUnique({ where: { userId } });
  if (!tokenData?.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID || "",
      client_secret: GOOGLE_CLIENT_SECRET || "",
      refresh_token: tokenData.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await res.json();
  if (!tokens.access_token) return null;

  await prisma.googleToken.update({
    where: { userId },
    data: {
      accessToken: tokens.access_token,
      expiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
    },
  });

  return tokens.access_token;
}

async function getAccessToken(userId: string): Promise<string | null> {
  const tokenData = await prisma.googleToken.findUnique({ where: { userId } });
  if (!tokenData) return null;

  if (new Date(tokenData.expiresAt) > new Date()) {
    return tokenData.accessToken;
  }

  return refreshAccessToken(userId);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: weddingId } = await params;
  const body = await req.json().catch(() => ({}));
  const action = body.action || "create";

  const accessToken = await getAccessToken(session.user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Google account not connected. Connect it first." }, { status: 400 });
  }

  if (action === "create") {
    try {
      const pickerRes = await fetch("https://photoslibrary.googleapis.com/v1/PickerSessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaItemsFilter: {
            mediaTypeFilter: {
              mediaTypes: ["PHOTO"],
            },
          },
        }),
      });

      const pickerData = await pickerRes.json();

      if (!pickerData.id || !pickerData.pickerUri) {
        console.error("Picker session error:", pickerData);
        return NextResponse.json({ error: "Failed to create picker session" }, { status: 500 });
      }

      return NextResponse.json({
        sessionId: pickerData.id,
        pickerUri: pickerData.pickerUri,
      });
    } catch (err: any) {
      console.error("Create picker error:", err);
      return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
    }
  }

  if (action === "import") {
    const { sessionId } = body;
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    try {
      const sessionRes = await fetch(
        `https://photoslibrary.googleapis.com/v1/PickerSessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const sessionData = await sessionRes.json();

      if (sessionData.mediaItemsFilterStatus === "NO_MEDIA_ITEMS_SELECTED") {
        return NextResponse.json({ error: "No photos selected" }, { status: 400 });
      }

      if (!sessionData.mediaItems?.length) {
        return NextResponse.json({ error: "No media items found" }, { status: 400 });
      }

      const photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
      if (!photoDump) {
        return NextResponse.json({ error: "Photo dump not found" }, { status: 404 });
      }

      const existingCount = await prisma.photo.count({ where: { photoDumpId: photoDump.id } });

      const imported: Array<{ id: string; url: string; thumbnailUrl: string; filename: string; source: string }> = [];
      for (const item of sessionData.mediaItems) {
        const baseUrl = item.mediaItem?.baseUrl || item.baseUrl;
        if (!baseUrl) continue;

        const photo: { id: string; url: string; thumbnailUrl: string; filename: string; source: string } = await prisma.photo.create({
          data: {
            photoDumpId: photoDump.id,
            url: baseUrl,
            thumbnailUrl: `${baseUrl}=w400-h300-c`,
            filename: item.mediaItem?.filename || item.filename || "google-photo.jpg",
            width: item.mediaItem?.mediaMetadata?.width ? parseInt(item.mediaItem.mediaMetadata.width) : 0,
            height: item.mediaItem?.mediaMetadata?.height ? parseInt(item.mediaItem.mediaMetadata.height) : 0,
            mime: item.mediaItem?.mimeType || "image/jpeg",
            source: "google",
            googleMediaId: item.mediaItem?.id || item.id || "",
            order: existingCount + imported.length,
          },
        });

        imported.push(photo);
      }

      return NextResponse.json({ photos: imported, count: imported.length });
    } catch (err: any) {
      console.error("Import from Google error:", err);
      return NextResponse.json({ error: err.message || "Import failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenData = await prisma.googleToken.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json({ connected: !!tokenData });
}
