import type { ManagedUser, ModeratedComment } from "@/features/users/types";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getUsers(accessToken: string): Promise<ManagedUser[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/users`, {
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

// null covers both "no such user" (404 → the page calls notFound()) and
// transient failures — either way there's nothing to render.
export async function getUser(
  id: string,
  accessToken: string
): Promise<ManagedUser | null> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/${id}`, {
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getUserComments(
  id: string,
  accessToken: string
): Promise<ModeratedComment[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/users/${id}/comments`, {
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
