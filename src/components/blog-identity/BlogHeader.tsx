"use client";

import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";
import { AdminHeaderActions } from "./AdminHeaderActions";
import { BlogHeaderShell } from "./BlogHeaderShell";
import { BlogLoginTrigger } from "./BlogLoginTrigger";

// Resolved on the client, not during the server render. This used to read the
// auth cookie in a Server Component, and because it is rendered from
// (blog)/layout.tsx that single read made every public page per-request —
// including pages with no request-dependent content of their own. Moving it
// here is what lets those pages be prerendered.
//
// The trade-off this created, and how it is paid: the prerendered HTML is identical for every
// visitor, so it cannot know who is asking. The first version assumed "signed out" while waiting
// for /api/me, which is right for everyone except the one person who is signed in — who saw the
// logged-out header flip to the account menu on every single load.
//
// So the header no longer guesses. Until `isResolved`, it renders neither state: the slot holds
// its space and asserts nothing. Resolution comes from a local hint applied in a layout effect,
// before paint and before the network — so both answers arrive at hydration, and neither visitor
// watches the header change its mind. /api/me still overrules it a moment later.
export function BlogHeader() {
  const { user, isAuthenticated, isResolved } = useCurrentUser();

  if (!isResolved) {
    return (
      <BlogHeaderShell
        rightSlot={
          // Matches the login button's footprint so resolving it does not shift the header.
          // aria-hidden because "we do not know yet" is not information a screen reader needs —
          // the real control is announced when it appears, a few milliseconds later.
          <div aria-hidden className="h-9 w-9 shrink-0 sm:w-[6.5rem]" />
        }
        isAuthenticated={false}
      />
    );
  }

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
