import type { Project } from "@/features/projects/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/projects`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}
