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
  slug: string;
  slugEn: string | null;
  slugEs: string | null;
  content: string;
  contentEn: string | null;
  contentEs: string | null;
  isPublished: boolean;
  allowComments: boolean;
  coverUrl: string | null;
  coverUrlEn: string | null;
  coverUrlEs: string | null;
  coverAlt: string | null;
  coverAltEn: string | null;
  coverAltEs: string | null;
  metaDescription: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionEs: string | null;
  authorId: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
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
