import type { Topic } from "@/features/topics/types";

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  allowComments: boolean;
  authorId: string;
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
