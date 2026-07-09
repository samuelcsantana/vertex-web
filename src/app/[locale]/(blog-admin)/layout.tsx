import { cookies } from "next/headers";

import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeaderShell } from "@/components/blog-identity/BlogHeaderShell";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { AdminHeaderActions } from "@/components/blog-identity/AdminHeaderActions";
import { getProfile } from "@/features/auth/api/profile-service";

export default async function BlogAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // These routes are already gated by proxy.ts, so the cookie is guaranteed
  // present here; the profile fetch is only for the avatar/name display and
  // is allowed to come back empty without blocking access to the page.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;

  return (
    <div className="relative flex min-h-screen flex-col text-slate-300">
      <BlogBackground />
      <BlogHeaderShell
        rightSlot={<AdminHeaderActions redirectTo="/" profile={profile ?? undefined} />}
        isAuthenticated
        logoutRedirectTo="/"
      />
      <main id="main-content" className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
