"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
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

// The form field defaults to "" (no cover set), but the backend's
// coverUrl is z.string().url().optional() — an empty string would fail
// that validation, so it needs to become "not sent" instead.
function normalizeCoverUrl<T extends { coverUrl?: string }>(data: T) {
  return { ...data, coverUrl: data.coverUrl || undefined };
}

// Both the home page and the dashboard listing live under the [locale]
// dynamic segment (src/app/[locale]/(blog)/page.tsx and
// .../(blog-admin)/dashboard/posts/page.tsx) — a literal revalidatePath("/")
// only busts the cache entry for the exact path it's given, which is just
// the unprefixed pt route. /en and /es visitors kept seeing stale data
// until getPosts()'s own 60s revalidate window passed on its own.
//
// The docs' officially recommended fix for a dynamic segment —
// revalidatePath("/[locale]", "page") — was verified NOT to actually bust
// the cache in this Next.js 16 + Turbopack dev setup (confirmed live: the
// backend had already deleted the post, but a fresh, uncached browser
// context still rendered it 5+ seconds later). revalidatePath("/", "layout")
// — the docs' own "revalidate everything" option — was verified to work
// reliably and near-instantly instead, so this uses that rather than the
// theoretically-narrower pattern that didn't actually work here. The
// broader invalidation (busting /about's cache too, etc.) is a non-issue
// at this app's size.
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
  throw redirect({ href: "/dashboard/posts", locale: await getLocale() });
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

  revalidatePostListings();
}
