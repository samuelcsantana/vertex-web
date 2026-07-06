"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import type { CreatePostInput } from "@/features/posts/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface PostActionResult {
  success: boolean;
  error?: string;
}

// The form field defaults to "" (no cover set), but the backend's
// coverUrl is z.string().url().optional() — an empty string would fail
// that validation, so it needs to become "not sent" instead.
function normalizeCoverUrl<T extends { coverUrl?: string }>(data: T) {
  return { ...data, coverUrl: data.coverUrl || undefined };
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
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    return { success: false, error: "Failed to create post." };
  }

  // The blog listing lives at "/" now ((blog)/page.tsx) — "/blog" is just a
  // redirect("/") stub left over from the samuel.dev identity restructuring,
  // so revalidating it never actually busted the home page's cache.
  revalidatePath("/");
  revalidatePath("/dashboard/posts");

  return { success: true };
}

export async function updatePostAction(
  id: string,
  data: Partial<CreatePostInput>
): Promise<PostActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to update a post.",
    };
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
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  if (!response.ok) {
    return { success: false, error: "Failed to update post." };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/posts");
  throw redirect({ href: "/dashboard/posts", locale: await getLocale() });
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

  revalidatePath("/");
  revalidatePath("/dashboard/posts");
}
