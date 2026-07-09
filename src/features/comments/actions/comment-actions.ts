"use server";

import { cookies } from "next/headers";

import type { Comment } from "@/features/comments/types";
import {
  apiErrorMessage,
  apiErrorsTranslator,
} from "@/lib/api-error-message";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface CreateCommentResult {
  success: boolean;
  error?: string;
  comment?: { id: string; content: string; createdAt: string };
}

interface DeleteCommentResult {
  success: boolean;
  error?: string;
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
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
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
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "postCommentFailed"),
    };
  }

  const comment = await response.json();

  return { success: true, comment };
}

// The comment list is fetched client-side into useState (see
// CommentsSection), not server-rendered/cached, so there's no
// revalidatePath to call here — the caller removes the row from local
// state itself once this resolves successfully.
export async function deleteCommentAction(
  commentId: string
): Promise<DeleteCommentResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "deleteCommentFailed"),
    };
  }

  return { success: true };
}
