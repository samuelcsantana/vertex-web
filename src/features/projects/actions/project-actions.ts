"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import type { CreateProjectInput } from "@/features/projects/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

interface ProjectActionResult {
  success: boolean;
  error?: string;
}

export async function createProjectAction(
  data: CreateProjectInput
): Promise<ProjectActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return {
      success: false,
      error: "You must be signed in to create a project.",
    };
  }

  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!response.ok) {
    return { success: false, error: "Failed to create project." };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard/projects");

  return { success: true };
}

export async function deleteProjectAction(id: string): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return;
  }

  await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    headers: { Cookie: `access_token=${accessToken}` },
    cache: "no-store",
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard/projects");
}
