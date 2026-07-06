"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface TopicActionResult {
  success: boolean;
  error?: string;
}

export async function createTopicAction(
  name: string
): Promise<TopicActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to create a topic.",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/topics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ name }),
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
      error: body?.message ?? "Failed to create topic.",
    };
  }

  revalidatePath("/dashboard/topics");
  revalidatePath("/dashboard/posts");

  return { success: true };
}

export async function updateTopicAction(
  id: string,
  name: string
): Promise<TopicActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to update a topic.",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/topics/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ name }),
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
      error: body?.message ?? "Failed to update topic.",
    };
  }

  revalidatePath("/dashboard/topics");
  revalidatePath("/dashboard/posts");

  return { success: true };
}

export async function deleteTopicAction(id: string): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return;
  }

  try {
    await fetch(`${API_URL}/topics/${id}`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return;
  }

  revalidatePath("/dashboard/topics");
  revalidatePath("/dashboard/posts");
}
