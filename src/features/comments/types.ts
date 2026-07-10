export interface CommentAuthor {
  id: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  // Only present when the API identified the caller as an admin (see
  // getCommentsAction) — never part of the public payload.
  email?: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}
