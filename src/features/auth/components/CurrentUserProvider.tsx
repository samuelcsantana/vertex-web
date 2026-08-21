"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import type { CurrentUser } from "@/features/auth/types";
import {
  anonymousSessionHint,
  readSessionHint,
  resolveDisplayName,
  subscribeToSessionHint,
  writeSessionHint,
} from "@/features/auth/session-hint";

/** What the header needs to draw an account control: a name to show and, maybe, a picture. */
export interface HeaderIdentity {
  displayName: string;
  avatarUrl: string | null;
}

interface CurrentUserContextValue {
  user: CurrentUser | null;
  // The name and avatar to paint *now*, from /api/me when it has answered and from the local hint
  // until then. Separate from `user` on purpose: the hint has no id, email or role, and nothing
  // that decides what a visitor may do should ever be able to read a forgeable store.
  //
  // Measured on the live site: a signed-in /api/me takes ~750-860ms, so a header that waits for it
  // shows a nameless control for ~780ms after first paint. This is what closes that gap.
  identity: HeaderIdentity | null;
  // Not the same as `user !== null`: a signed-in visitor whose profile call
  // fails is authenticated without a resolved profile. The header renders the
  // account menu in that case rather than falling back to a login button.
  isAuthenticated: boolean;
  // True until the first /api/me response lands. Components that render
  // admin-only UI should treat "loading" as "not an admin" rather than
  // showing a skeleton — the answer is null for every visitor but one.
  //
  // The header is the documented exception: it is a single always-visible slot, so guessing wrong
  // there is a visible state flip rather than a control appearing late. It reads `isResolved`.
  isLoading: boolean;
  // False only between the server render and hydration. After that the UI has a defensible answer
  // — optimistic, from the local hint — even though /api/me is still in flight.
  isResolved: boolean;
  // Re-reads /api/me. Auth changes through Server Actions (login, logout),
  // which update the cookie but cannot touch React state on the client, so
  // every call site that used to rely on `router.refresh()` re-rendering a
  // server-side header has to call this too.
  refresh: () => void;
}

// The default makes useCurrentUser() safe outside a provider: the
// admin tree resolves the profile server-side and passes it down as a
// prop, so components shared between both trees must not blow up there.
const CurrentUserContext = createContext<CurrentUserContextValue>({
  user: null,
  identity: null,
  isAuthenticated: false,
  isLoading: false,
  isResolved: true,
  refresh: () => {},
});

export function useCurrentUser(): CurrentUserContextValue {
  return useContext(CurrentUserContext);
}

/**
 * Both hints below go through useSyncExternalStore rather than an effect that calls setState.
 *
 * That is not a lint workaround — it is what the API is for. localStorage is an external store React
 * cannot observe, and useSyncExternalStore is the one hook that reads such a store *and* takes a
 * separate server snapshot, so hydration renders exactly what the server sent and then switches. An
 * effect would paint the wrong header once first; a useState initializer would render markup the
 * server never produced.
 */
/**
 * Notifies once, right after hydration commits.
 *
 * A no-op subscribe is not enough, and the difference is easy to miss: useSyncExternalStore only
 * re-reads its snapshot when something renders, so a store nobody notifies keeps reporting the
 * server value until an unrelated state change happens to force a render. For a signed-in visitor
 * the hint store changes and covers it up; for everyone else the next render was the /api/me
 * response — which would have put the login button back behind the network round trip this whole
 * change exists to remove.
 */
function subscribeToHydration(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

export function CurrentUserProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // False on the server, true from hydration on. Once true, the absence of a hint is itself an
  // answer for this browser, so the header can commit to "anonymous" without waiting for a round
  // trip that will say the same thing.
  const isResolved = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  // Subscribed, not merely read: the `storage` event fires in other tabs, so signing out in one tab
  // corrects the header in the rest instead of leaving them showing an account menu for a session
  // that no longer exists.
  const hint = useSyncExternalStore(
    subscribeToSessionHint,
    readSessionHint,
    anonymousSessionHint
  );

  const [user, setUser] = useState<CurrentUser | null>(null);
  // null means "/api/me has not answered yet", which is different from "answered no" — the hint
  // fills that gap and nothing else does.
  const [serverAnswer, setServerAnswer] = useState<boolean | null>(null);
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

        const authenticated = Boolean(data.isAuthenticated);

        setUser(data.user ?? null);
        setServerAnswer(authenticated);
        setIsLoading(false);
        // The authoritative answer overwrites the guess in both directions: a session that expired
        // elsewhere clears the hint, a first sign-in on this browser sets it — now including the
        // name and avatar, so the next load paints them at hydration instead of after the fetch.
        writeSessionHint(authenticated, data.user ?? null);
      } catch {
        // An aborted fetch means a newer request is already in flight (or the
        // tree unmounted) — leaving state untouched is correct in both cases.
        if (controller.signal.aborted) {
          return;
        }

        // Deliberately leaves both the hint and `serverAnswer` alone. This branch is a failed
        // request, not an answer: the session may be valid and the network merely down. Treating it
        // as a logout would sign the user out of the UI over one dropped request, and would
        // reintroduce the signed-out flash on the next load.
        setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [reloadToken]);

  const isAuthenticated = serverAnswer ?? hint.isAuthenticated;

  // /api/me wins the moment it lands; until then the hint stands in. Null means neither has an
  // identity to offer — an anonymous visitor, or a signed-in one on a browser that has not
  // completed a load yet.
  const identity: HeaderIdentity | null = user
    ? { displayName: resolveDisplayName(user), avatarUrl: user.avatarUrl }
    : hint.displayName !== null
      ? { displayName: hint.displayName, avatarUrl: hint.avatarUrl }
      : null;

  return (
    <CurrentUserContext.Provider
      value={{ user, identity, isAuthenticated, isLoading, isResolved, refresh }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}
