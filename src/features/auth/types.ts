import type { UserRole } from "@/features/auth/api/profile-service";

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
