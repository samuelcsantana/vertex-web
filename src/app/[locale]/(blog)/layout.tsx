import { setRequestLocale } from "next-intl/server";

import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeader } from "@/components/blog-identity/BlogHeader";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { CurrentUserProvider } from "@/features/auth/components/CurrentUserProvider";

export default async function BlogHomeLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // next-intl needs this in every layout and page that should prerender, not
  // just the root one: layouts and pages render concurrently, so a child can
  // reach for the locale before an ancestor has cached it and fall back to
  // reading the request headers. BlogFooter translates, so without this the
  // whole group stays per-request.
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    // One provider for the whole public tree, so the header and any
    // admin-only controls inside a page share a single /api/me request
    // instead of each resolving auth for itself. Nothing in this layout
    // touches the request any more, which is what makes the pages below
    // prerenderable.
    <CurrentUserProvider>
      <div className="relative flex min-h-screen flex-col text-slate-300">
        <BlogBackground />
        <BlogHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <BlogFooter />
      </div>
    </CurrentUserProvider>
  );
}
