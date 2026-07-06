import type { Topic } from "@/features/topics/types";

export interface PostAuthor {
  id: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  allowComments: boolean;
  authorId: string;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  topics: Topic[];
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  allowComments: boolean;
  topicIds: string[];
}
