import {
  getPresignedUploadUrlAction,
  type UploadContentType,
} from "@/features/posts/actions/upload-actions";
import { downscaleImage } from "@/lib/downscale-image";

const ALLOWED_CONTENT_TYPES: UploadContentType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function isAllowedContentType(type: string): type is UploadContentType {
  return (ALLOWED_CONTENT_TYPES as string[]).includes(type);
}

export async function uploadImage(file: File): Promise<string> {
  if (!isAllowedContentType(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  const optimizedFile = await downscaleImage(file);

  if (!isAllowedContentType(optimizedFile.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  const result = await getPresignedUploadUrlAction(
    optimizedFile.name,
    optimizedFile.type
  );

  if (!result.success || !result.presignedUrl) {
    throw new Error(result.error ?? "Failed to request an upload URL.");
  }

  let uploadResponse: Response;

  try {
    uploadResponse = await fetch(result.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": optimizedFile.type },
      body: optimizedFile,
    });
  } catch {
    throw new Error("Failed to upload the image. Please try again.");
  }

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload the image.");
  }

  const publicUrl = result.presignedUrl.split("?")[0];

  return publicUrl;
}
