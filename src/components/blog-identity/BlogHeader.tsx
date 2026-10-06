"use client";

import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";
import { AdminHeaderActions } from "./AdminHeaderActions";
import { BlogHeaderShell } from "./BlogHeaderShell";
import { BlogLoginTrigger } from "./BlogLoginTrigger";

export function BlogHeader() {
  const { identity, isAuthenticated, isResolved } = useCurrentUser();

  if (!isResolved) {
    return (
      <BlogHeaderShell
        rightSlot={
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

  return (
    <BlogHeaderShell
      rightSlot={<AdminHeaderActions identity={identity ?? undefined} />}
      isAuthenticated
    />
  );
}
