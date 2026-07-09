import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Info } from "lucide-react";

import { getPathname } from "@/i18n/routing";
import { getAboutContent } from "@/features/about/api/about-service";
import {
  getLocalizedContent,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();

  if (!about) {
    return {};
  }

  const locale = await getLocale();
  const siteUrl = await getSiteUrl();

  // Same duplicate-content reasoning as blog/[slug]/page.tsx's
  // generateMetadata: a locale without its own translation serves the pt
  // fallback under its own URL, so its canonical points back at the real
  // pt page instead of self-referencing, and only genuinely translated
  // locales are advertised as hreflang alternates.
  const translatedLocales = getTranslatedLocales(about);
  const isTranslated = (translatedLocales as string[]).includes(locale);
  const canonicalLocale = isTranslated ? locale : "pt";

  return {
    alternates: {
      canonical: `${siteUrl}${getPathname({ href: "/about", locale: canonicalLocale })}`,
      languages: Object.fromEntries(
        translatedLocales.map((loc) => [
          loc,
          `${siteUrl}${getPathname({ href: "/about", locale: loc })}`,
        ])
      ),
    },
  };
}

export default async function AboutPage() {
  const about = await getAboutContent();
  const locale = await getLocale();
  const t = await getTranslations("Navigation");
  const tAbout = await getTranslations("About");

  // Same per-locale resolution posts use: en/es render their own
  // translation when one exists and fall back to the required pt text
  // otherwise — the helpers only need the content/contentEn/contentEs
  // shape, which AboutContent shares with Post by design.
  const content = about ? getLocalizedContent(about, locale) : "";
  const isTranslated = about
    ? (getTranslatedLocales(about) as string[]).includes(locale)
    : true;

  // The About content is expected to open with its own "# Heading" (and is
  // styled/sized as one) — in that case it already is the page's real h1
  // and a second one would just duplicate it in the heading outline. The
  // sr-only fallback below only renders when the content doesn't start
  // with a heading, so there's always exactly one h1, never zero or two.
  // Unlike the blog post page there's no separate title field to draw an
  // h1 from, and remapping the body's own headings down a level would
  // visibly shrink the intended opening heading — so that approach (used
  // on the post page) isn't used here.
  const startsWithHeading = /^#{1,6}\s+/.test(content.trimStart());

  return (
    // Same outer/inner wrapper split as blog/[slug]/page.tsx: the outer box
    // matches the header's own effective width so this page's content
    // shares its left edge with the header logo above it (previously this
    // was a single mx-auto max-w-3xl centered on the *full* page width,
    // ~200px out of step with the header on wide screens).
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:max-w-6xl xl:px-0">
      <div className="mx-auto max-w-3xl lg:mx-0">
        {!isTranslated && (
          <div className="mb-8 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>{tAbout("translationFallbackNotice")}</p>
          </div>
        )}

        <article className="prose prose-invert lg:prose-lg">
          {!startsWithHeading && <h1 className="sr-only">{t("about")}</h1>}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
