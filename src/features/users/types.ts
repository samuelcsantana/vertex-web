export type UserRole = "user" | "admin";

export interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  githubId: string | null;
  googleId: string | null;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
}

export interface ModeratedComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}
