import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import "../[locale]/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeaderShell } from "@/components/blog-identity/BlogHeaderShell";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { AdminHeaderActions } from "@/components/blog-identity/AdminHeaderActions";
import { AdminLanguageSwitcher } from "@/components/AdminLanguageSwitcher";
import { getProfile } from "@/features/auth/api/profile-service";
import { resolveDisplayName } from "@/features/auth/session-hint";
import { applyAdminLocale } from "@/i18n/admin-locale";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Painel — samuelsantana.dev",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function AdminHeader() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;

  const identity = profile
    ? { displayName: resolveDisplayName(profile), avatarUrl: profile.avatarUrl }
    : undefined;

  return (
    <BlogHeaderShell
      localeSwitcher={<AdminLanguageSwitcher />}
      rightSlot={<AdminHeaderActions redirectTo="/" identity={identity} />}
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full scroll-smooth`}
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
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col text-slate-300">
              <BlogBackground />
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
