import type { AboutContent } from "@/features/about/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getAboutContent(): Promise<AboutContent | null> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/about`, {
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
