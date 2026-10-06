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
import { SITE_URL } from "@/lib/site-url";
import { SOCIAL_PROFILE_URLS } from "@/lib/social-profiles";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();

  if (!about) {
    return {};
  }

  const locale = await getLocale();

  const translatedLocales = getTranslatedLocales(about);
  const isTranslated = (translatedLocales as string[]).includes(locale);
  const canonicalLocale = isTranslated ? locale : "pt";

  return {
    alternates: {
      canonical: `${SITE_URL}${getPathname({ href: "/about", locale: canonicalLocale })}`,
      languages: Object.fromEntries(
        translatedLocales.map((loc) => [
          loc,
          `${SITE_URL}${getPathname({ href: "/about", locale: loc })}`,
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

  const content = about ? getLocalizedContent(about, locale) : "";
  const isTranslated = about
    ? (getTranslatedLocales(about) as string[]).includes(locale)
    : true;

  const startsWithHeading = /^#\s+/.test(content.trimStart());
  const { intro, sections } = splitMarkdownSections(content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Samuel Santana",
    url: `${SITE_URL}${getPathname({ href: "/about", locale })}`,
    sameAs: SOCIAL_PROFILE_URLS,
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="order-last lg:order-none lg:col-span-8">
          {!isTranslated && (
            <div className="mb-8 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>{tAbout("translationFallbackNotice")}</p>
            </div>
          )}

          <div className="prose lg:prose-lg mb-10 max-w-none">
            {!startsWithHeading && <h1 className="sr-only">{t("about")}</h1>}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
          </div>

          <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="group scroll-mt-24 rounded-3xl border border-border bg-card/30 p-8 backdrop-blur-lg transition-all duration-500 target:ring-2 target:ring-primary/60 hover:border-foreground/20 hover:bg-card/50 md:p-10"
              >
                <div className="mb-6 flex items-center gap-4 border-b border-border/50 pb-4">
                  <span className="font-mono text-sm font-semibold text-primary">
                    0{index + 1}.
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground transition-colors">
                    {section.heading}
                  </h2>
                </div>
                <div className="prose prose-sm sm:prose-base max-w-none">
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
