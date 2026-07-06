"use server";

import { cookies } from "next/headers";

import type { Comment } from "@/features/comments/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface CreateCommentResult {
  success: boolean;
  error?: string;
  comment?: { id: string; content: string; createdAt: string };
}

export async function getCommentsAction(postId: string): Promise<Comment[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      cache: "no-store",
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function createCommentAction(
  postId: string,
  content: string
): Promise<CreateCommentResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return { success: false, error: "You must be signed in to comment." };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: "POST",
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
      error: body?.message ?? "Failed to post comment.",
    };
  }

  const comment = await response.json();

  return { success: true, comment };
}
