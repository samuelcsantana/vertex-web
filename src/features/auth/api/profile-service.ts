const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export type UserRole = "user" | "admin";

export interface UserProfile {
  sub: string;
  email: string;
  role: UserRole;
  name: string | null;
  // How the user wants to be shown publicly — wins over name everywhere a
  // visitor-facing surface renders an identity (displayName ?? name).
  displayName: string | null;
  avatarUrl: string | null;
  githubId: string | null;
  googleId: string | null;
  iat: number;
  exp: number;
}

export async function getProfile(
  accessToken: string
): Promise<UserProfile | null> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/profile`, {
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
