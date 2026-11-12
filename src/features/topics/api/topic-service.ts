import type { Topic } from "@/features/topics/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getTopics(): Promise<Topic[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/topics`, {
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
