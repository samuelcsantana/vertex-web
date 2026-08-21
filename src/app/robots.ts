import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

// One entry, because the panel has one URL. It used to live under the
// [locale] segment, where "as-needed" gave the default locale no prefix and
// the others their own — so covering /dashboard and /profile meant listing
// six paths and keeping that list in step with the locale config. Everything
// gated now sits under /admin, which has no locale variants to enumerate.
const disallow = ["/admin"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
