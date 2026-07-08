import type { Locale } from "@/i18n/config";
import type { Post } from "@/features/posts/types";

export function getLocalizedTitle(
  post: Pick<Post, "title" | "titleEn" | "titleEs">,
  locale: string
) {
  if (locale === "en" && post.titleEn) return post.titleEn;
  if (locale === "es" && post.titleEs) return post.titleEs;
  return post.title;
}

export function getLocalizedContent(
  post: Pick<Post, "content" | "contentEn" | "contentEs">,
  locale: string
) {
  if (locale === "en" && post.contentEn) return post.contentEn;
  if (locale === "es" && post.contentEs) return post.contentEs;
  return post.content;
}

// The slug a post is reachable at for a given locale — mirrors
// vertex-api's PostsService.findPublishedBySlug fallback: a post without
// its own slugEn/slugEs is served under the default (pt) slug for that
// locale too, so links/canonical URLs never point at a slug that doesn't
// actually resolve.
export function getLocalizedSlug(
  post: Pick<Post, "slug" | "slugEn" | "slugEs">,
  locale: string
) {
  if (locale === "en" && post.slugEn) return post.slugEn;
  if (locale === "es" && post.slugEs) return post.slugEs;
  return post.slug;
}

// Which locales this post genuinely has its own content in — pt is
// always included (title/slug/content are required fields); en/es only
// count once their own content is filled in. This is a different
// question from "what URL does this locale resolve to" (getLocalizedSlug
// above always resolves, via the pt fallback): it's used wherever a
// locale needs to be presented as a real, distinct translation rather
// than the pt-fallback content reachable under that locale's URL — see
// sitemap.ts's hreflang alternates, blog/[slug]/page.tsx's canonical/
// hreflang metadata, and the Manage Posts dashboard table's language
// badges.
export function getTranslatedLocales(
  post: Pick<Post, "contentEn" | "contentEs">
): Locale[] {
  const locales: Locale[] = ["pt"];
  if (post.contentEn) locales.push("en");
  if (post.contentEs) locales.push("es");
  return locales;
}
