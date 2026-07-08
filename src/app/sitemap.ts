import type { MetadataRoute } from "next";

import { getPosts } from "@/features/posts/api/post-service";
import {
  getLocalizedSlug,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";
import { getPathname, routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Locale = (typeof routing.locales)[number];

function absoluteUrl(href: string, locale: Locale) {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

function buildAlternates(
  hrefForLocale: (locale: Locale) => string,
  locales: readonly Locale[]
) {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(hrefForLocale(locale), locale)])
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
// `locales` defaults to every configured locale (right for static routes,
// which are genuinely translated everywhere via next-intl messages) but
// posts pass only the locales they actually have their own content in —
// otherwise a pt-only post's /en/ and /es/ URLs (which just show the pt
// fallback) would get listed as if they were real translations, hreflang-
// pointing search engines at duplicate content under the wrong language.
function buildEntriesForRoute(
  hrefForLocale: (locale: Locale) => string,
  { lastModified, changeFrequency, priority }: RouteOptions,
  locales: readonly Locale[] = routing.locales
): MetadataRoute.Sitemap {
  const alternates = buildAlternates(hrefForLocale, locales);

  return locales.map((locale) => ({
    url: absoluteUrl(hrefForLocale(locale), locale),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: alternates },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...buildEntriesForRoute(() => "/", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    }),
    ...buildEntriesForRoute(() => "/about", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.flatMap((post) =>
    buildEntriesForRoute(
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
