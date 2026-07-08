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
  slug: string;
  content: string;
  contentEn: string | null;
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
  slug: string;
  content: string;
  contentEn?: string;
  isPublished: boolean;
  allowComments: boolean;
  coverUrl?: string;
  coverAlt?: string;
  topicIds: string[];
}
