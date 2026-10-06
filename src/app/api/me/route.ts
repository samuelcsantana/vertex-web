import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getProfile } from "@/features/auth/api/profile-service";
import type { CurrentUser } from "@/features/auth/types";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;

  const user: CurrentUser | null = profile
    ? {
        id: profile.sub,
        email: profile.email,
        role: profile.role,
        name: profile.name,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      }
    : null;

  return NextResponse.json(
    { user, isAuthenticated: Boolean(accessToken) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
