import { LOCALES } from "@/i18n/config";
import type { Post } from "@/features/posts/types";
import { getSlugSourceLocale } from "@/features/posts/utils/localized-content";

const API_URL = process.env.VERTEX_API_URL ?? "http://localhost:3333";

export async function getPosts(): Promise<Post[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/posts`, {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getPostBySlug(
  slug: string,
  locale?: string
): Promise<Post | null> {
  let response: Response;

  try {
    const url = new URL(`${API_URL}/posts/${slug}`);
    if (locale) url.searchParams.set("locale", locale);
    response = await fetch(url, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return response.json();
}

// A shared post URL carries one locale's slug, but next-intl's
// locale-detection redirect in proxy.ts re-prefixes the path for the
// visitor's saved locale without translating the slug — a pt link opened
// by a visitor who chose English lands on /en/blog/<pt-slug>, which
// vertex-api's findPublishedBySlug (correctly) doesn't match once the post
// has its own slugEn. Instead of 404ing, retry the lookup under the other
// locales and report which locale the slug actually belongs to, so the
// page can render that locale's content and offer a link over to the
// visitor's own language. contentLocale is always the requested locale on
// the direct-hit path, so callers where the slug matches never behave
// differently than a plain getPostBySlug.
export async function getPostBySlugCrossLocale(
  slug: string,
  locale: string
): Promise<{ post: Post; contentLocale: string } | null> {
  const post = await getPostBySlug(slug, locale);
  if (post) return { post, contentLocale: locale };

  for (const other of LOCALES) {
    if (other === locale) continue;

    const crossPost = await getPostBySlug(slug, other);
    if (crossPost) {
      // getSlugSourceLocale can disagree with `other` when the slug only
      // matched via the pt fallback (slugEn/slugEs unset) — the slug's
      // real owner is what should drive which content renders.
      return {
        post: crossPost,
        contentLocale: getSlugSourceLocale(crossPost, slug) ?? other,
      };
    }
  }

  return null;
}

export async function getDashboardPosts(
  accessToken: string
): Promise<Post[]> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/dashboard/posts`, {
      headers: { Cookie: `access_token=${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  return response.json();
}
