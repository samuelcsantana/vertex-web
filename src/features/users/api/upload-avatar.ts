import { requestAvatarUploadUrlAction } from "@/features/users/actions/user-actions";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Mirrors src/features/posts/api/upload-image.ts, but through the
// user-scoped avatar presign route (the blog-media one is admin-only).
export async function uploadAvatarImage(file: File): Promise<string> {
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }

  const result = await requestAvatarUploadUrlAction(file.name, file.type);

  if (!result.success || !result.presignedUrl) {
    throw new Error(result.error ?? "Failed to request an upload URL.");
  }

  let uploadResponse: Response;

  try {
    uploadResponse = await fetch(result.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
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
