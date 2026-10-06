import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

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
