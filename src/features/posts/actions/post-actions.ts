"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import type { CreatePostInput } from "@/features/posts/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface PostActionResult {
  success: boolean;
  error?: string;
}

export async function createPostAction(
  data: CreatePostInput
): Promise<PostActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to create a post.",
    };
  }

  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!response.ok) {
    return { success: false, error: "Failed to create post." };
  }

  revalidatePath("/blog");
  revalidatePath("/dashboard/posts");

  return { success: true };
}

export async function deletePostAction(id: string): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return;
  }

  await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE",
    headers: { Cookie: `access_token=${accessToken}` },
    cache: "no-store",
  });

  revalidatePath("/blog");
  revalidatePath("/dashboard/posts");
}
