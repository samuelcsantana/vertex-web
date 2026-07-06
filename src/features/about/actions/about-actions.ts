"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface AboutActionResult {
  success: boolean;
  error?: string;
}

export async function updateAboutContentAction(
  content: string
): Promise<AboutActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to update the About page.",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/about`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ content }),
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return {
      success: false,
      error: body?.message ?? "Failed to update the About page.",
    };
  }

  revalidatePath("/about");
  revalidatePath("/dashboard/about");

  return { success: true };
}
