import { cookies } from "next/headers";

import { getProfile } from "@/features/auth/api/profile-service";
import { AdminHeaderActions } from "./AdminHeaderActions";
import { BlogHeaderShell } from "./BlogHeaderShell";
import { BlogLoginTrigger } from "./BlogLoginTrigger";

export async function BlogHeader() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return <BlogHeaderShell rightSlot={<BlogLoginTrigger />} />;
  }

  // Cookie presence alone is what actually gates the admin UI (matches
  // checkSessionAction's rationale); the profile fetch is only used to
  // render the avatar/name and is allowed to come back empty without
  // flipping the header back to logged-out.
  const profile = await getProfile(accessToken);

  return (
    <BlogHeaderShell
      rightSlot={<AdminHeaderActions profile={profile ?? undefined} />}
    />
  );
}
