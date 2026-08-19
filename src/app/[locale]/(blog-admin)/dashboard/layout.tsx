import { Suspense } from "react";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { getProfile } from "@/features/auth/api/profile-service";

// proxy.ts only proves a cookie is present — it can't decode the JWT's role
// claim at the edge without a network round trip, so it lets any
// authenticated user (including a plain Google-account login with role
// "user") through to /dashboard/**. This layout is the real gate: every
// page under dashboard/ requires role === "admin", verified via a real
// backend call (getProfile -> GET /auth/profile), not just cookie presence.
// /profile lives outside this subtree on purpose — any logged-in user can
// view their own profile, not just admins.
async function AdminGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;

  if (profile?.role !== "admin") {
    throw redirect({ href: "/", locale: await getLocale() });
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The role check has to happen per request, so it lives inside its own
  // Suspense boundary rather than in the layout body: that keeps the gate
  // request-time while letting the surrounding chrome prerender. The fallback
  // is deliberately empty — anything rendered here would be visible for a
  // moment to a non-admin who is about to be redirected away.
  return (
    <Suspense fallback={null}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
