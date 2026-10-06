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

export function getLocalizedSlug(
  post: Pick<Post, "slug" | "slugEn" | "slugEs">,
  locale: string
) {
  if (locale === "en" && post.slugEn) return post.slugEn;
  if (locale === "es" && post.slugEs) return post.slugEs;
  return post.slug;
}

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

export function getLocalizedCoverAlt(
  post: Pick<Post, "coverAlt" | "coverAltEn" | "coverAltEs">,
  locale: string
) {
  if (locale === "en" && post.coverAltEn) return post.coverAltEn;
  if (locale === "es" && post.coverAltEs) return post.coverAltEs;
  return post.coverAlt;
}

export function getLocalizedMetaDescription(
  post: Pick<Post, "metaDescription" | "metaDescriptionEn" | "metaDescriptionEs">,
  locale: string
) {
  if (locale === "en") return post.metaDescriptionEn;
  if (locale === "es") return post.metaDescriptionEs;
  return post.metaDescription;
}

export function getTranslatedLocales(
  post: Pick<Post, "contentEn" | "contentEs">
): Locale[] {
  const locales: Locale[] = ["pt"];
  if (post.contentEn) locales.push("en");
  if (post.contentEs) locales.push("es");
  return locales;
}
