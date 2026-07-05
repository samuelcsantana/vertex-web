import type { Post } from "@/features/posts/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_URL}/posts`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const response = await fetch(`${API_URL}/posts/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getDashboardPosts(
  accessToken: string
): Promise<Post[]> {
  const response = await fetch(`${API_URL}/dashboard/posts`, {
    headers: { Cookie: `access_token=${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}
