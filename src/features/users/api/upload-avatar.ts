import { requestAvatarUploadUrlAction } from "@/features/users/actions/user-actions";
import { downscaleImage } from "@/lib/downscale-image";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AVATAR_MAX_DIMENSION = 512;

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

  return result.presignedUrl.split("?")[0];
}
