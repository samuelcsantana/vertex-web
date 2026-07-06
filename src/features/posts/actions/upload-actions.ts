"use server";

import { cookies } from "next/headers";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export type UploadContentType = "image/jpeg" | "image/png" | "image/webp";

interface PresignedUploadResult {
  success: boolean;
  presignedUrl?: string;
  fileKey?: string;
  error?: string;
}

export async function getPresignedUploadUrlAction(
  fileName: string,
  contentType: UploadContentType
): Promise<PresignedUploadResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to upload images.",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/uploads/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ fileName, contentType }),
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    return { success: false, error: "Failed to request an upload URL." };
  }

  const data = await response.json();

  return {
    success: true,
    presignedUrl: data.presignedUrl,
    fileKey: data.fileKey,
  };
}
