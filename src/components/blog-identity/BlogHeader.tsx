"use client";

import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";
import { AdminHeaderActions } from "./AdminHeaderActions";
import { BlogHeaderShell } from "./BlogHeaderShell";
import { BlogLoginTrigger } from "./BlogLoginTrigger";

// Resolved on the client, not during the server render. This used to read the
// auth cookie in a Server Component, and because it is rendered from
// (blog)/layout.tsx that single read made every public page per-request —
// including pages with no request-dependent content of their own. Moving it
// here is what lets those pages be prerendered; see
// docs/rendering-strategies.md.
//
// The trade-off: the signed-in owner briefly sees the logged-out header
// before /api/me answers. For everyone else the first paint is already the
// final state, which is the opposite of the old behaviour, where every
// visitor waited on a vertex-api round trip that only ever mattered to one
// person.
export function BlogHeader() {
  const { user, isAuthenticated } = useCurrentUser();

  if (!isAuthenticated) {
    return (
      <BlogHeaderShell rightSlot={<BlogLoginTrigger />} isAuthenticated={false} />
    );
  }

  // Cookie presence alone is what gates the admin UI; the profile can come
  // back empty (backend hiccup) without flipping the header back to
  // logged-out — AdminHeaderActions degrades to a plain logout button.
  return (
    <BlogHeaderShell
      rightSlot={<AdminHeaderActions profile={user ?? undefined} />}
      isAuthenticated
    />
  );
}
