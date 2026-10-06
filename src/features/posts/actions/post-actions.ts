"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CreatePostInput } from "@/features/posts/types";
import {
  apiErrorMessage,
  apiErrorsTranslator,
} from "@/lib/api-error-message";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface PostActionResult {
  success: boolean;
  error?: string;
}

function normalizeCoverUrl<
  T extends { coverUrl?: string; coverUrlEn?: string; coverUrlEs?: string },
>(data: T) {
  return {
    ...data,
    coverUrl: data.coverUrl || undefined,
    coverUrlEn: data.coverUrlEn || undefined,
    coverUrlEs: data.coverUrlEs || undefined,
  };
}

function revalidatePostListings() {
  revalidatePath("/", "layout");
}

export async function createPostAction(
  data: CreatePostInput
): Promise<PostActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(normalizeCoverUrl(data)),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "createPostFailed"),
    };
  }

  revalidatePostListings();
  throw redirect("/admin/dashboard/posts");
}

export async function updatePostAction(
  id: string,
  data: Partial<CreatePostInput>
): Promise<PostActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("notSignedIn") };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/posts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(normalizeCoverUrl(data)),
      cache: "no-store",
    });
  } catch {
    const t = await apiErrorsTranslator();
    return { success: false, error: t("network") };
  }

  if (!response.ok) {
    return {
      success: false,
      error: await apiErrorMessage(response, "updatePostFailed"),
    };
  }

  revalidatePostListings();
  throw redirect("/admin/dashboard/posts");
}

export async function deletePostAction(id: string): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return;
  }

  try {
    await fetch(`${API_URL}/posts/${id}`, {
      method: "DELETE",
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return;
  }

  revalidatePostListings();
}
