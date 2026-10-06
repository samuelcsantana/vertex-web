import type { MetadataRoute } from "next";

import { getAboutContent } from "@/features/about/api/about-service";
import { getPosts } from "@/features/posts/api/post-service";
import {
  getLocalizedSlug,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";
import { getPathname, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Locale = (typeof routing.locales)[number];

function absoluteUrl(href: string, locale: Locale) {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

function buildAlternates(
  hrefForLocale: (locale: Locale) => string,
  locales: readonly Locale[]
) {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      absoluteUrl(hrefForLocale(locale), locale),
    ])
  );
}

interface RouteOptions {
  lastModified: Date;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}

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
  const [posts, about] = await Promise.all([getPosts(), getAboutContent()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    ...buildEntriesForRoute(() => "/", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    }),
    ...buildEntriesForRoute(
      () => "/about",
      {
        lastModified: about ? new Date(about.updatedAt) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      },
      about ? getTranslatedLocales(about) : ["pt"]
    ),
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
