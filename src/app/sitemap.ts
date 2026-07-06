import type { MetadataRoute } from "next";

import { getPosts } from "@/features/posts/api/post-service";
import { getPathname, routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Locale = (typeof routing.locales)[number];

function absoluteUrl(href: string, locale: Locale) {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

function buildAlternates(href: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(href, locale)])
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
// pointing at the other language versions of that same page.
function buildEntriesForRoute(
  href: string,
  { lastModified, changeFrequency, priority }: RouteOptions
): MetadataRoute.Sitemap {
  const alternates = buildAlternates(href);

  return routing.locales.map((locale) => ({
    url: absoluteUrl(href, locale),
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
    ...buildEntriesForRoute("/", {
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    }),
    ...buildEntriesForRoute("/about", {
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.flatMap((post) =>
    buildEntriesForRoute(`/blog/${post.slug}`, {
      lastModified: new Date(post.updatedAt ?? post.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticRoutes, ...postRoutes];
}
