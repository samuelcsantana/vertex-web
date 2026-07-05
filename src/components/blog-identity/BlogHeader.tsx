import { cookies } from "next/headers";

import { AdminHeaderActions } from "./AdminHeaderActions";
import { BlogHeaderShell } from "./BlogHeaderShell";
import { BlogLoginTrigger } from "./BlogLoginTrigger";

export async function BlogHeader() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("access_token");

  return (
    <BlogHeaderShell
      rightSlot={isAuthenticated ? <AdminHeaderActions /> : <BlogLoginTrigger />}
    />
  );
}
