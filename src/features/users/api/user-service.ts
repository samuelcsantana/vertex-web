import type { ManagedUser } from "@/features/users/types";

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
