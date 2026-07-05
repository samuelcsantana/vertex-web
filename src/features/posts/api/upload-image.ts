import {
  getPresignedUploadUrlAction,
  type UploadContentType,
} from "@/features/posts/actions/upload-actions";

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

  const result = await getPresignedUploadUrlAction(file.name, file.type);

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
