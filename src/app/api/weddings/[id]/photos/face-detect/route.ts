import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import path from "path";
import fs from "fs";
import { TextEncoder, TextDecoder } from "util";

if (typeof globalThis.TextEncoder === "undefined") {
  (globalThis as any).TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  (globalThis as any).TextDecoder = TextDecoder;
}

let faceapi: any = null;
let modelsLoaded = false;

async function loadFaceApi() {
  if (faceapi && modelsLoaded) return faceapi;
  const mod = await import("@vladmandic/face-api");
  faceapi = mod;

  if (!modelsLoaded) {
    const modelPath = path.join(process.cwd(), "public", "models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    modelsLoaded = true;
  }

  return faceapi;
}

export async function POST(
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

    const { photoIds } = await req.json();

    const api = await loadFaceApi();

    const photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
    if (!photoDump) {
      return NextResponse.json({ error: "Photo dump not found" }, { status: 404 });
    }

    const where: any = { photoDumpId: photoDump.id, facesProcessed: false };
    if (photoIds && photoIds.length > 0) {
      where.id = { in: photoIds };
    }

    const photos = await prisma.photo.findMany({ where, orderBy: { order: "asc" } });

    let totalFaces = 0;
    let processed = 0;

    for (const photo of photos) {
      try {
        const imgRes = await fetch(photo.url);
        const arrayBuf = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        const blob = new Blob([buffer], { type: photo.mime || "image/jpeg" });
        const bitmap = await createImageBitmap(blob);

        const detections = await api
          .detectAllFaces(bitmap, new api.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        for (const detection of detections) {
          const box = detection.detection.box;
          const embedding = Array.from(detection.descriptor);

          await prisma.faceEmbedding.create({
            data: {
              photoId: photo.id,
              x: box.x / photo.width,
              y: box.y / photo.height,
              w: box.width / photo.width,
              h: box.height / photo.height,
              embedding: JSON.stringify(embedding),
            },
          });
          totalFaces++;
        }

        await prisma.photo.update({
          where: { id: photo.id },
          data: { facesProcessed: true },
        });
        processed++;
      } catch (err) {
        console.error(`Face detection failed for photo ${photo.id}:`, err);
      }
    }

    return NextResponse.json({
      processed,
      totalFaces,
      totalPhotos: photos.length,
    });
  } catch (error: any) {
    console.error("Face detection error:", error);
    return NextResponse.json({ error: error.message || "Face detection failed" }, { status: 500 });
  }
}
