import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "samuel.dev — Engenharia de Software, Performance e Arquitetura",
    template: "%s | samuel.dev",
  },
  description:
    "Blog técnico de Samuel Santana sobre arquitetura de software, performance web e engenharia frontend.",
  openGraph: {
    siteName: "samuel.dev",
    type: "website",
    url: SITE_URL,
    // Site-wide default so any page without a more specific openGraph.images
    // (set individually where it matters, e.g. a post's own cover image)
    // still shares a real image instead of a blank card — metadataBase
    // above resolves this relative path to an absolute URL automatically.
    images: ["/og-fallback.png"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
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
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
