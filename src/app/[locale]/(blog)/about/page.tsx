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
  // The intro (everything before the first "##") keeps its own opening
  // "# heading" — that's what the startsWithHeading/h1 logic above is
  // about — while the "##" sections become the numbered cards below.
  const { intro, sections } = splitMarkdownSections(content);

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
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          {!isTranslated && (
            <div className="mb-8 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>{tAbout("translationFallbackNotice")}</p>
            </div>
          )}

          <div className="prose prose-invert lg:prose-lg mb-10 max-w-none">
            {!startsWithHeading && <h1 className="sr-only">{t("about")}</h1>}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
          </div>

          <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="group scroll-mt-24 rounded-3xl border border-white/10 bg-slate-900/30 p-8 shadow-[0_8px_30px_rgb(16,185,129,0.02)] backdrop-blur-lg transition-all duration-500 target:ring-2 target:ring-emerald-400/60 hover:border-white/20 hover:bg-slate-900/50 hover:shadow-[0_8px_30px_rgb(16,185,129,0.05)] md:p-10"
              >
                <div className="mb-6 flex items-center gap-4 border-b border-white/5 pb-4">
                  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text font-mono text-sm font-semibold text-transparent">
                    0{index + 1}.
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-100 transition-colors group-hover:text-white">
                    {section.heading}
                  </h2>
                </div>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.body}
                  </ReactMarkdown>
                </div>
              </section>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-span-4">
          <AboutProfileHeader />
        </aside>
      </div>
    </div>
  );
}
