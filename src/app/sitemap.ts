import type { MetadataRoute } from "next";

import { getAboutContent } from "@/features/about/api/about-service";
import { getPosts } from "@/features/posts/api/post-service";
import {
  getLocalizedSlug,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";
import { getPathname, routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

type Locale = (typeof routing.locales)[number];

function absoluteUrl(siteUrl: string, href: string, locale: Locale) {
  return `${siteUrl}${getPathname({ href, locale })}`;
}

function buildAlternates(
  siteUrl: string,
  hrefForLocale: (locale: Locale) => string,
  locales: readonly Locale[]
) {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      absoluteUrl(siteUrl, hrefForLocale(locale), locale),
    ])
  );
}

interface RouteOptions {
  lastModified: Date;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}

// Sub-path routing gives every locale its own real, crawlable URL (pt at
// the root since "as-needed" hides its prefix, en/es under /en and /es),
// so each route gets one sitemap entry per locale, with hreflang alternates
// pointing at the other language versions of that same page. hrefForLocale
// is a function (not a fixed string) because posts can have a different
// slug per locale — static routes like "/" and "/about" just ignore the
// locale argument and return the same path for all of them.
//
// `locales` defaults to every configured locale (right for "/", whose
// content — the post listing chrome — is genuinely translated everywhere
// via next-intl messages) but routes with per-locale DB content (posts,
// /about) pass only the locales they actually have their own content in —
// otherwise a pt-only page's /en/ and /es/ URLs (which just show the pt
// fallback) would get listed as if they were real translations, hreflang-
// pointing search engines at duplicate content under the wrong language.
function buildEntriesForRoute(
  siteUrl: string,
  hrefForLocale: (locale: Locale) => string,
  { lastModified, changeFrequency, priority }: RouteOptions,
  locales: readonly Locale[] = routing.locales
): MetadataRoute.Sitemap {
  const alternates = buildAlternates(siteUrl, hrefForLocale, locales);

  return locales.map((locale) => ({
    url: absoluteUrl(siteUrl, hrefForLocale(locale), locale),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: alternates },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();
  const [posts, about] = await Promise.all([getPosts(), getAboutContent()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...buildEntriesForRoute(siteUrl, () => "/", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    }),
    ...buildEntriesForRoute(
      siteUrl,
      () => "/about",
      {
        lastModified: about ? new Date(about.updatedAt) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      },
      // pt-only fallback when the API is unreachable — the pt page always
      // exists, while advertising en/es without knowing they're real
      // translations risks the exact duplicate-content listing this
      // parameter exists to avoid.
      about ? getTranslatedLocales(about) : ["pt"]
    ),
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.flatMap((post) =>
    buildEntriesForRoute(
      siteUrl,
      (locale) => `/blog/${getLocalizedSlug(post, locale)}`,
      {
        lastModified: new Date(post.updatedAt ?? post.createdAt),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      getTranslatedLocales(post)
    )
  );

  return [...staticRoutes, ...postRoutes];
}
