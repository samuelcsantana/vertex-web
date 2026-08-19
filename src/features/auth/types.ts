import type { UserRole } from "@/features/auth/api/profile-service";

// The subset of the JWT profile that client components are allowed to see.
// Deliberately narrower than `UserProfile`: no token, no `iat`/`exp`, no
// linked-provider ids. Anything added here is served to the browser by
// `GET /api/me`, so add a field only when a client component renders it.
export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
