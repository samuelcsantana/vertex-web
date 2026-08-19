import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getProfile } from "@/features/auth/api/profile-service";
import type { CurrentUser } from "@/features/auth/types";

// The access token is HttpOnly, so client components can never resolve auth
// state themselves. This endpoint is the single place that does it for them:
// it reads the cookie server-side, asks vertex-api who the caller is, and
// returns only the fields the UI actually renders (see CurrentUser).
//
// It exists so the public pages can be prerendered. Resolving auth inside a
// page's server render is what previously forced `/`, `/about` and every post
// to be rebuilt per request — every anonymous visitor paid for a vertex-api
// round trip so that one admin could see edit buttons. Now the pages are the
// same for everyone and the admin's own UI is resolved after hydration.
//
// Never cached: the response is per-session by definition, and it is only
// ever fetched from the browser (same-origin, so the cookie rides along).
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

  // `isAuthenticated` is deliberately not `user !== null`. Cookie presence is
  // what gates the authenticated header; the profile call is only there for
  // the avatar and name, and a vertex-api hiccup must not flip a signed-in
  // visitor back to a login button. The server-rendered header drew the same
  // distinction before this endpoint existed — keep it.
  return NextResponse.json(
    { user, isAuthenticated: Boolean(accessToken) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
