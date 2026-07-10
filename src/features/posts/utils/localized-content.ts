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

// The inverse of getLocalizedSlug: which locale a given slug belongs to,
// or null if it isn't one of this post's slugs at all. pt wins ties (it's
// the original, required version) — if an admin gave a translation the
// same slug as the pt one, that slug never 404s under any locale anyway.
// Used to recover from locale-detection redirects that re-prefix a shared
// URL without translating its slug (see getPostBySlugCrossLocale).
export function getSlugSourceLocale(
  post: Pick<Post, "slug" | "slugEn" | "slugEs">,
  slug: string
): Locale | null {
  if (post.slug === slug) return "pt";
  if (post.slugEn === slug) return "en";
  if (post.slugEs === slug) return "es";
  return null;
}

export function getLocalizedCoverUrl(
  post: Pick<Post, "coverUrl" | "coverUrlEn" | "coverUrlEs">,
  locale: string
) {
  if (locale === "en" && post.coverUrlEn) return post.coverUrlEn;
  if (locale === "es" && post.coverUrlEs) return post.coverUrlEs;
  return post.coverUrl;
}

// Resolved independently from the image on purpose: the common "one
// image, translated alts" case needs an en/es alt to apply to the
// pt-fallback image. The reverse mismatch (locale-specific image with a
// pt-fallback alt) is on the author to fill in.
export function getLocalizedCoverAlt(
  post: Pick<Post, "coverAlt" | "coverAltEn" | "coverAltEs">,
  locale: string
) {
  if (locale === "en" && post.coverAltEn) return post.coverAltEn;
  if (locale === "es" && post.coverAltEs) return post.coverAltEs;
  return post.coverAlt;
}

// The manually-written meta description for a given locale, or null if
// that locale has none of its own. Deliberately does NOT fall back to
// another locale's text the way getLocalizedTitle/Content/Slug do — a
// locale with no override should fall through to an auto-generated
// excerpt of *that locale's own* (possibly itself pt-fallback) content
// instead of silently reusing another language's hand-written SEO copy,
// which could describe different text than what's actually on the page.
// See blog/[slug]/page.tsx's generateMetadata for the auto-generate step.
export function getLocalizedMetaDescription(
  post: Pick<Post, "metaDescription" | "metaDescriptionEn" | "metaDescriptionEs">,
  locale: string
) {
  if (locale === "en") return post.metaDescriptionEn;
  if (locale === "es") return post.metaDescriptionEs;
  return post.metaDescription;
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
