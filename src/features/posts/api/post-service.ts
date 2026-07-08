import type { Post } from "@/features/posts/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getPosts(): Promise<Post[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/posts`, {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getPostBySlug(
  slug: string,
  locale?: string
): Promise<Post | null> {
  let response: Response;

  try {
    const url = new URL(`${API_URL}/posts/${slug}`);
    if (locale) url.searchParams.set("locale", locale);
    response = await fetch(url, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getDashboardPosts(
  accessToken: string
): Promise<Post[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/dashboard/posts`, {
      headers: { Cookie: `access_token=${accessToken}` },
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
