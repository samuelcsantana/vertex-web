import type { Topic } from "@/features/topics/types";

export interface PostAuthor {
  id: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Post {
  id: string;
  title: string;
  titleEn: string | null;
  titleEs: string | null;
  // slug is the pt (default-locale) slug; slugEn/slugEs are optional
  // per-locale overrides — a post without one is served under this
  // default slug for that locale too (see getPostBySlug/findPublishedBySlug).
  slug: string;
  slugEn: string | null;
  slugEs: string | null;
  content: string;
  contentEn: string | null;
  contentEs: string | null;
  isPublished: boolean;
  allowComments: boolean;
  // Cover image + alt are per locale (covers can carry embedded text,
  // e.g. the article title in the art) — same optional-with-pt-fallback
  // pattern as title/content; see localized-content.ts's
  // getLocalizedCoverUrl/getLocalizedCoverAlt.
  coverUrl: string | null;
  coverUrlEn: string | null;
  coverUrlEs: string | null;
  coverAlt: string | null;
  coverAltEn: string | null;
  coverAltEs: string | null;
  // Manually-written search-result snippet, per locale — a locale
  // without its own falls back to an auto-generated excerpt of that
  // locale's own content, not another locale's text (see
  // localized-content.ts's getLocalizedMetaDescription and
  // blog/[slug]/page.tsx's generateMetadata).
  metaDescription: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionEs: string | null;
  authorId: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
}

export interface CreatePostInput {
  title: string;
  titleEn?: string;
  titleEs?: string;
  slug: string;
  slugEn?: string;
  slugEs?: string;
  content: string;
  contentEn?: string;
  contentEs?: string;
  isPublished: boolean;
  allowComments: boolean;
  coverUrl?: string;
  coverUrlEn?: string;
  coverUrlEs?: string;
  coverAlt?: string;
  coverAltEn?: string;
  coverAltEs?: string;
  metaDescription?: string;
  metaDescriptionEn?: string;
  metaDescriptionEs?: string;
  topicIds: string[];
}
