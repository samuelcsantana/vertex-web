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

// Surfaces Nest's default exception body ({ message, error, statusCode })
// when there is one — e.g. the friendly "slug already in use" message from
// a 409 on a duplicate slugEn/slugEs — instead of always showing a generic
// fallback that throws away real information from the API.
async function extractErrorMessage(response: Response, fallback: string) {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // Response body wasn't JSON — fall through to the generic message.
  }
  return fallback;
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
    return {
      success: false,
      error: await extractErrorMessage(response, "Failed to create post."),
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
    return {
      success: false,
      error: await extractErrorMessage(response, "Failed to update post."),
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
