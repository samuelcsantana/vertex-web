import { Suspense } from "react";
import { cookies } from "next/headers";

import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeaderShell } from "@/components/blog-identity/BlogHeaderShell";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { AdminHeaderActions } from "@/components/blog-identity/AdminHeaderActions";
import { getProfile } from "@/features/auth/api/profile-service";

// Declared, not inherited. Everything under this group renders per request
// today because AdminHeader and dashboard/layout.tsx read the auth cookie —
// but that is a side effect of the current implementation, and a refactor
// that moved the cookie read elsewhere would silently make these routes
// cacheable. These pages show one user their own private data, so SSR is a
// requirement here, not an optimisation: ISR or SSG would mean serving one
// admin's dashboard to whoever asks next. See docs/rendering-strategies.md.
export const dynamic = "force-dynamic";

async function AdminHeader() {
  // These routes are already gated by proxy.ts, so the cookie is guaranteed
  // present here; the profile fetch is only for the avatar/name display and
  // is allowed to come back empty without blocking access to the page.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;

  return (
    <BlogHeaderShell
      rightSlot={
        <AdminHeaderActions redirectTo="/" profile={profile ?? undefined} />
      }
      isAuthenticated
      logoutRedirectTo="/"
    />
  );
}

export default function BlogAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col text-slate-300">
      <BlogBackground />
      {/* Only the avatar/name needs the request. Keeping the profile fetch in
          its own Suspense boundary means the chrome around it — background,
          header frame, footer — is part of the prerendered shell instead of
          waiting on a round trip to vertex-api. The gated content itself is
          held back by dashboard/layout.tsx, which is a separate boundary. */}
      <Suspense
        fallback={
          <BlogHeaderShell
            rightSlot={<AdminHeaderActions redirectTo="/" />}
            isAuthenticated
            logoutRedirectTo="/"
          />
        }
      >
        <AdminHeader />
      </Suspense>
      <main id="main-content" className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
