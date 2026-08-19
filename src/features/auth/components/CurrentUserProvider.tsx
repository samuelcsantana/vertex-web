"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { CurrentUser } from "@/features/auth/types";

interface CurrentUserContextValue {
  user: CurrentUser | null;
  // Not the same as `user !== null`: a signed-in visitor whose profile call
  // fails is authenticated without a resolved profile. The header renders the
  // account menu in that case rather than falling back to a login button.
  isAuthenticated: boolean;
  // True until the first /api/me response lands. Components that render
  // admin-only UI should treat "loading" as "not an admin" rather than
  // showing a skeleton — the answer is null for every visitor but one.
  isLoading: boolean;
  // Re-reads /api/me. Auth changes through Server Actions (login, logout),
  // which update the cookie but cannot touch React state on the client, so
  // every call site that used to rely on `router.refresh()` re-rendering a
  // server-side header has to call this too.
  refresh: () => void;
}

// The default makes useCurrentUser() safe outside a provider: the
// (blog-admin) tree resolves the profile server-side and passes it down as a
// prop, so components shared between both trees must not blow up there.
const CurrentUserContext = createContext<CurrentUserContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  refresh: () => {},
});

export function useCurrentUser(): CurrentUserContextValue {
  return useContext(CurrentUserContext);
}

export function CurrentUserProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Bumping this re-runs the effect below; a plain async function would race
  // with the mount fetch and could resolve out of order.
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/me", {
          signal: controller.signal,
        });
        const data = response.ok
          ? await response.json()
          : { user: null, isAuthenticated: false };

        setUser(data.user ?? null);
        setIsAuthenticated(Boolean(data.isAuthenticated));
        setIsLoading(false);
      } catch {
        // An aborted fetch means a newer request is already in flight (or the
        // tree unmounted) — leaving state untouched is correct in both cases.
        if (controller.signal.aborted) {
          return;
        }

        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [reloadToken]);

  return (
    <CurrentUserContext.Provider
      value={{ user, isAuthenticated, isLoading, refresh }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}
