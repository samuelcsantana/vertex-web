import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

// "as-needed" means the default locale (pt) has no URL prefix, so
// /dashboard and /profile alone cover it; en/es need their own prefixed
// entries since they live at /en/dashboard, /es/profile, etc.
const nonDefaultLocales = routing.locales.filter(
  (locale) => locale !== routing.defaultLocale
);

const GATED_PATHS = ["/dashboard", "/profile"];

const disallow = [
  ...GATED_PATHS,
  ...nonDefaultLocales.flatMap((locale) =>
    GATED_PATHS.map((path) => `/${locale}${path}`)
  ),
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
