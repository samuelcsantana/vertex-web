import type { MetadataRoute } from "next";

import { getPosts } from "@/features/posts/api/post-service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // The site serves pt/en/es from the same URL via a locale cookie (no
  // [locale] route segment), so there's no distinct URL per language to
  // point these alternates at — all three keys resolve to the same post
  // URL. Still included since it's harmless and matches what a locale-
  // prefixed version of this site would declare here.
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`;

    return {
      url,
      lastModified: new Date(post.updatedAt ?? post.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          pt: url,
          en: url,
          es: url,
        },
      },
    };
  });

  return [...staticRoutes, ...postRoutes];
}
