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
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <CurrentUserProvider>
      <div className="relative flex min-h-screen flex-col text-foreground">
        <BlogBackground />
        <BlogHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <BlogFooter />
      </div>
    </CurrentUserProvider>
  );
}
