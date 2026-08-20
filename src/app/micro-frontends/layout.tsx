import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// The app's only other root layout lives under [locale]; a segment outside that tree has none to
// inherit, so this one supplies <html> and <body>. Next supports exactly this — multiple root
// layouts, as long as one applies per route.
import "../[locale]/globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Module Federation — demonstração cross-origin",
  // A technical demo has no place in search results or in the sitemap: it is evidence for someone
  // who was pointed at it, not a page of the site.
  robots: { index: false, follow: false },
};

export default function MicroFrontendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
