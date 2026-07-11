import { requestAvatarUploadUrlAction } from "@/features/users/actions/user-actions";
import { downscaleImage } from "@/lib/downscale-image";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Avatars never render larger than small circles, so 512px already covers
// any retina variant of them.
const AVATAR_MAX_DIMENSION = 512;

// Mirrors src/features/posts/api/upload-image.ts, but through the
// user-scoped avatar presign route (the blog-media one is admin-only).
export async function uploadAvatarImage(file: File): Promise<string> {
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  const optimizedFile = await downscaleImage(file, {
    maxDimension: AVATAR_MAX_DIMENSION,
  });

  if (!ALLOWED_CONTENT_TYPES.includes(optimizedFile.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  const result = await requestAvatarUploadUrlAction(
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

  // The object's public address is the signed URL minus the AWS query
  // string used to authorize the upload (see upload-image.ts).
  return result.presignedUrl.split("?")[0];
}
