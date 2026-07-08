import type { Topic } from "@/features/topics/types";

export interface PostAuthor {
  id: string;
  name: string | null;
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
  coverUrl: string | null;
  coverAlt: string | null;
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
  coverAlt?: string;
  topicIds: string[];
}
