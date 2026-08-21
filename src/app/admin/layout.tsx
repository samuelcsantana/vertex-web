import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// The app's other root layout lives under [locale]; this segment sits outside
// that tree and so has none to inherit, and supplies <html> and <body> itself.
// Next supports exactly this — several root layouts, as long as one applies per
// route. /micro-frontends does the same.
import "../[locale]/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeaderShell } from "@/components/blog-identity/BlogHeaderShell";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { AdminHeaderActions } from "@/components/blog-identity/AdminHeaderActions";
import { AdminLanguageSwitcher } from "@/components/AdminLanguageSwitcher";
import { getProfile } from "@/features/auth/api/profile-service";
import { applyAdminLocale } from "@/i18n/admin-locale";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Painel — samuelsantana.dev",
  // A gated panel has no business in search results, and unlike the public
  // pages there is no canonical or hreflang story to get right here: these
  // URLs have no locale variants to point at each other.
  robots: { index: false, follow: false },
};

// Declared, not inherited. Everything under here renders per request today
// because the locale comes from a cookie and dashboard/layout.tsx reads the
// auth cookie — but that is a property of the current implementation, and a
// refactor moving either read elsewhere would silently make these routes
// cacheable. These pages show one user their own private data, so SSR is a
// requirement here, not an optimisation: ISR or SSG would mean serving one
// admin's dashboard to whoever asks next.
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
      localeSwitcher={<AdminLanguageSwitcher />}
      rightSlot={
        <AdminHeaderActions redirectTo="/" profile={profile ?? undefined} />
      }
      isAuthenticated
      logoutRedirectTo="/"
    />
  );
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await applyAdminLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="America/Bahia"
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col text-slate-300">
              <BlogBackground />
              {/* Only the avatar/name needs the profile round trip. Keeping it
                  in its own Suspense boundary means the chrome around it —
                  background, header frame, footer — flushes without waiting on
                  vertex-api. The gated content itself is held back by
                  dashboard/layout.tsx, which is a separate boundary. */}
              <Suspense
                fallback={
                  <BlogHeaderShell
                    localeSwitcher={<AdminLanguageSwitcher />}
                    rightSlot={<AdminHeaderActions redirectTo="/" />}
                    isAuthenticated
                    logoutRedirectTo="/"
                  />
                }
              >
                <AdminHeader />
              </Suspense>
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <BlogFooter />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
