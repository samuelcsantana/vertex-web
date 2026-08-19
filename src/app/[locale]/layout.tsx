import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
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

interface LocaleParams {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  // params.locale, NOT getLocale(): getLocale() resolves the locale from the
  // request headers, which is a dynamic API. Because this is the root layout,
  // that single call opted *every* route in the app into per-request
  // rendering — including the ones that have no per-request data at all, so
  // generateStaticParams below prerendered nothing. The original reason for
  // getLocale() was to still resolve a usable locale while the layout body is
  // about to notFound() a garbage [locale] segment; the hasLocale() fallback
  // here preserves exactly that without reading the request.
  const { locale: requestedLocale } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Samuel Santana | Software Engineer",
      template: "%s | Samuel Santana",
    },
    description: t("siteDescription"),
    openGraph: {
      siteName: "Samuel Santana",
      type: "website",
      url: SITE_URL,
      // Site-wide default so any page without a more specific openGraph.images
      // (set individually where it matters, e.g. a post's own cover image)
      // still shares a real image instead of a blank card — metadataBase
      // above resolves this relative path to an absolute URL automatically.
      images: ["/og-fallback.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface RootLayoutProps extends LocaleParams {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts this subtree back into static rendering. Every next-intl server API
  // (getMessages, getTranslations) otherwise resolves the locale from the
  // request headers and forces per-request rendering, which is why nothing
  // under [locale] was prerendered before. Routes that still need per-request
  // data — auth cookies, host-derived canonical URLs — opt out individually with
  // `export const dynamic = "force-dynamic"`.
  setRequestLocale(locale);

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
