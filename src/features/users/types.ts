export type UserRole = "user" | "admin";

export interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  githubId: string | null;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
}
