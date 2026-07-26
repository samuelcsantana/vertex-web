import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Info } from "lucide-react";

import { getPathname } from "@/i18n/routing";
import { getAboutContent } from "@/features/about/api/about-service";
import { AboutProfileHeader } from "@/features/about/components/AboutProfileHeader";
import {
  getLocalizedContent,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";
import { splitMarkdownSections } from "@/features/posts/utils/split-markdown-sections";
import { TableOfContents } from "@/components/blog-identity/TableOfContents";
import { GLASS_CARD } from "@/components/blog-identity/glassStyles";
import { getSiteUrl } from "@/lib/site-url";
import { SOCIAL_PROFILE_URLS } from "@/lib/social-profiles";

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
  const { intro, sections } = splitMarkdownSections(content);
  const hasToc = sections.length > 0;

  const siteUrl = await getSiteUrl();
  // This is the page Google's search results currently surface for
  // "samuel santana dev" — carrying the Person schema (with sameAs) here,
  // not just on post pages, gives the entity graph its clearest signal on
  // the exact URL that's already ranking.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Samuel Santana",
    url: `${siteUrl}${getPathname({ href: "/about", locale })}`,
    sameAs: SOCIAL_PROFILE_URLS,
  };

  return (
    // Same outer/inner wrapper split as blog/[slug]/page.tsx: the outer box
    // matches the header's own effective width so this page's content
    // shares its left edge with the header logo above it (previously this
    // was a single mx-auto max-w-3xl centered on the *full* page width,
    // ~200px out of step with the header on wide screens).
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:max-w-6xl xl:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className={
          hasToc
            ? "lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8"
            : ""
        }
      >
        <div className="mx-auto max-w-3xl lg:mx-0">
          <AboutProfileHeader />

          {!isTranslated && (
            <div className="mb-8 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>{tAbout("translationFallbackNotice")}</p>
            </div>
          )}

          {!startsWithHeading && <h1 className="sr-only">{t("about")}</h1>}

          <div className="prose prose-invert mb-10 max-w-2xl text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
          </div>

          <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                // target: (pure CSS, no JS) rings the card the URL hash
                // currently points at — without it, jumping to a short
                // section here reads as "landing" on whichever card fills
                // most of the viewport, not the one the TOC link named.
                className={`scroll-mt-24 p-9 ring-emerald-400/60 transition-shadow target:ring-2 ${GLASS_CARD}`}
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="font-mono text-xs text-emerald-300/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-semibold text-white">
                    {section.heading}
                  </h2>
                </div>
                <div className="prose prose-invert prose-sm sm:prose-base">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.body}
                  </ReactMarkdown>
                </div>
              </section>
            ))}
          </div>
        </div>

        {hasToc && (
          <TableOfContents
            headings={sections.map((section) => ({
              id: section.id,
              text: section.heading,
              level: 2 as const,
            }))}
            label={tAbout("tableOfContentsLabel")}
          />
        )}
      </div>
    </div>
  );
}
