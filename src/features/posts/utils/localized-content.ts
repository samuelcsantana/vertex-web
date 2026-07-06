import type { Post } from "@/features/posts/types";

export function getLocalizedTitle(
  post: Pick<Post, "title" | "titleEn">,
  locale: string
) {
  return locale === "en" && post.titleEn ? post.titleEn : post.title;
}

export function getLocalizedContent(
  post: Pick<Post, "content" | "contentEn">,
  locale: string
) {
  return locale === "en" && post.contentEn ? post.contentEn : post.content;
}
