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
