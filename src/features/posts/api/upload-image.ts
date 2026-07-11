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

  // Shrink camera-original files in the browser before they ever hit the
  // bucket; the output type is always within the allowed set (WebP, or the
  // input's own format where WebP encoding isn't available).
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
    // A rejected fetch here (as opposed to a resolved-but-non-ok response)
    // usually means the storage bucket doesn't allow this origin (CORS),
    // not a problem the caller can retry their way out of.
    throw new Error("Failed to upload the image. Please try again.");
  }

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload the image.");
  }

  // The API only returns the signed PUT URL, not a separate public URL.
  // The object's public address is that same URL without the AWS query
  // string (signature, expiry, etc.) used to authorize the upload.
  const publicUrl = result.presignedUrl.split("?")[0];

  return publicUrl;
}
