import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  file: Buffer,
  folder: string,
  filename: string
): Promise<{
  url: string;
  thumbnailUrl: string;
  publicId: string;
  width: number;
  height: number;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename.replace(/\.[^.]+$/, ""),
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));

        const thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,f_auto,h_300,q_auto,w_400/v${result.version}/${result.public_id}`;

        resolve({
          url: result.secure_url,
          thumbnailUrl,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          size: result.bytes,
        });
      }
    );

    uploadStream.end(file);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export async function getCloudinaryStats(): Promise<{
  count: number;
  bytes: number;
}> {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 1,
    });
    return {
      count: result.resources?.length || 0,
      bytes: 0,
    };
  } catch {
    return { count: 0, bytes: 0 };
  }
}

export { cloudinary };
