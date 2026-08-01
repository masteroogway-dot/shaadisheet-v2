"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserRole } from "@/lib/permissions";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import crypto from "crypto";

function generateShareToken(): string {
  return crypto.randomBytes(16).toString("base64url").substring(0, 22);
}

export async function getOrCreatePhotoDump(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) throw new Error("Wedding not found");

  let photoDump = await prisma.photoDump.findUnique({
    where: { weddingId },
    include: { photos: { orderBy: { order: "asc" } } },
  });

  if (!photoDump) {
    photoDump = await prisma.photoDump.create({
      data: {
        weddingId,
        shareToken: generateShareToken(),
      },
      include: { photos: { orderBy: { order: "asc" } } },
    });
  }

  return photoDump;
}

export async function uploadPhotos(weddingId: string, files: Array<{ buffer: string; filename: string; mime: string }>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  const isPro = user?.plan === "pro";

  const wedding = await prisma.wedding.findFirst({
    where: { id: weddingId, userId: session.user.id },
  });
  if (!wedding) throw new Error("Wedding not found");

  let photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
  if (!photoDump) {
    photoDump = await prisma.photoDump.create({
      data: { weddingId, shareToken: generateShareToken() },
    });
  }

  const existingCount = await prisma.photo.count({ where: { photoDumpId: photoDump.id } });
  const existingSize = await prisma.photo.aggregate({ where: { photoDumpId: photoDump.id }, _sum: { size: true } });
  const currentSizeMB = (existingSize._sum.size || 0) / (1024 * 1024);

  if (!isPro) {
    const PHOTO_LIMIT = 50;
    const SIZE_LIMIT_MB = 500;
    const newFilesSizeMB = files.reduce((acc, f) => acc + Buffer.from(f.buffer, "base64").length, 0) / (1024 * 1024);

    if (existingCount >= PHOTO_LIMIT) {
      throw new Error(`Free plan limited to ${PHOTO_LIMIT} photos. Upgrade to Pro for unlimited.`);
    }
    if (currentSizeMB + newFilesSizeMB > SIZE_LIMIT_MB) {
      throw new Error(`Free plan limited to ${SIZE_LIMIT_MB}MB storage. You've used ${currentSizeMB.toFixed(1)}MB. Upgrade to Pro for unlimited.`);
    }
  }
  const folder = `shaadisheet/${weddingId}/photos`;

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(file.buffer, "base64");
    const filename = `${Date.now()}-${i}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    try {
      const uploaded = await uploadToCloudinary(buffer, folder, filename);

      const photo = await prisma.photo.create({
        data: {
          photoDumpId: photoDump.id,
          url: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          publicId: uploaded.publicId,
          filename: file.filename,
          width: uploaded.width,
          height: uploaded.height,
          size: uploaded.size,
          mime: file.mime,
          order: existingCount + i,
        },
      });

      results.push(photo);
    } catch (err) {
      console.error(`Failed to upload ${file.filename}:`, err);
    }
  }

  if (!photoDump.coverUrl && results.length > 0) {
    await prisma.photoDump.update({
      where: { id: photoDump.id },
      data: { coverUrl: results[0].thumbnailUrl },
    });
  }

  return { photos: results, total: existingCount + results.length };
}

export async function togglePhotoFavorite(photoId: string) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error("Photo not found");

  return prisma.photo.update({
    where: { id: photoId },
    data: { favorite: !photo.favorite },
  });
}

export async function deletePhoto(photoId: string) {
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error("Photo not found");

  if (photo.publicId) {
    await deleteFromCloudinary(photo.publicId);
  }

  await prisma.photo.delete({ where: { id: photoId } });

  const photoDump = await prisma.photoDump.findUnique({
    where: { id: photo.photoDumpId },
    include: { photos: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (photoDump && photoDump.coverUrl === photo.thumbnailUrl) {
    const newCover = photoDump.photos[0]?.thumbnailUrl || "";
    await prisma.photoDump.update({
      where: { id: photoDump.id },
      data: { coverUrl: newCover },
    });
  }

  return { success: true };
}

export async function deleteMultiplePhotos(photoIds: string[]) {
  const photos = await prisma.photo.findMany({
    where: { id: { in: photoIds } },
  });

  for (const photo of photos) {
    if (photo.publicId) {
      await deleteFromCloudinary(photo.publicId);
    }
  }

  await prisma.photo.deleteMany({ where: { id: { in: photoIds } } });

  return { deleted: photos.length };
}

export async function updatePhotoDumpSettings(weddingId: string, data: { title?: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
  if (!photoDump) throw new Error("Photo dump not found");

  return prisma.photoDump.update({
    where: { id: photoDump.id },
    data,
  });
}

export async function publishPhotoDump(weddingId: string, publish: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  let photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
  if (!photoDump) {
    photoDump = await prisma.photoDump.create({
      data: { weddingId, shareToken: generateShareToken() },
    });
  }

  return prisma.photoDump.update({
    where: { id: photoDump.id },
    data: { isPublished: publish },
  });
}

export async function regenerateShareToken(weddingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  let photoDump = await prisma.photoDump.findUnique({ where: { weddingId } });
  if (!photoDump) {
    photoDump = await prisma.photoDump.create({
      data: { weddingId, shareToken: generateShareToken() },
    });
  }

  return prisma.photoDump.update({
    where: { id: photoDump.id },
    data: { shareToken: generateShareToken() },
  });
}

export async function getPhotoDumpByToken(token: string) {
  const photoDump = await prisma.photoDump.findUnique({
    where: { shareToken: token },
    include: {
      photos: { orderBy: { order: "asc" } },
      wedding: { select: { name: true, weddingDate: true, weddingCity: true } },
    },
  });

  if (!photoDump || !photoDump.isPublished) return null;
  return photoDump;
}

export async function tagPhotos(photoIds: string[], tag: string) {
  const photos = await prisma.photo.findMany({ where: { id: { in: photoIds } } });

  for (const photo of photos) {
    const tags = JSON.parse(photo.tags || "[]");
    if (!tags.includes(tag)) {
      tags.push(tag);
      await prisma.photo.update({
        where: { id: photo.id },
        data: { tags: JSON.stringify(tags) },
      });
    }
  }

  return { tagged: photos.length };
}
