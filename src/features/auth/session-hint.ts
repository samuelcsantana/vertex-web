import type { CurrentUser } from "@/features/auth/types";

/**
 * A local, non-authoritative record of who this browser was signed in as last time.
 *
 * Why this exists: the public pages are prerendered, so the HTML every visitor receives is
 * identical and cannot know who is asking. The header therefore had to assume something before
 * /api/me answered, and it assumed "signed out" — which is right for every visitor except the one
 * person who is signed in, who saw the logged-out header flash on every load.
 *
 * The hint removes the guess without putting auth back into the render path. It is deliberately
 * NOT a credential and grants nothing: it is a plain string in localStorage, readable and forgeable
 * by any script on this origin, and the only thing it decides is which UI to paint before the real
 * answer arrives. Gating anything on it would be a security bug; /api/me remains the only source of
 * truth, and it overwrites this on every load.
 *
 * localStorage rather than a cookie because it never needs to reach the server — sending it would
 * add bytes to every request to answer a question the server already answers better.
 *
 * **It carries the display name and avatar, not just a boolean**, and the reason is measured. On the
 * live site a signed-in GET /api/me takes ~750-860ms against ~260-350ms signed out; the ~500ms
 * difference is vertex-api reading the user row. A boolean-only hint painted the account control at
 * first paint (~115ms) but with no identity in it, so the header showed a generic "sign out" button
 * for ~780ms before the name and avatar arrived. Both fields are already rendered on screen for
 * this same visitor, so storing them locally exposes nothing that was not already in front of them.
 *
 * The cost, stated plainly: change your display name or avatar and the previous one paints for one
 * frame's worth of network on the next load, until /api/me corrects it. That is the same trade the
 * boolean already made with the signed-in state itself.
 */
const SESSION_HINT_KEY = "vertex.session-hint";

export interface SessionHint {
  isAuthenticated: boolean;
  /** Already resolved through displayName ?? name ?? email — the header renders it verbatim. */
  displayName: string | null;
  avatarUrl: string | null;
}

const ANONYMOUS: SessionHint = {
  isAuthenticated: false,
  displayName: null,
  avatarUrl: null,
};

/** Safari in private mode throws on localStorage access, so every call is guarded. */
function safely<T>(operation: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    return operation();
  } catch {
    return fallback;
  }
}

export function resolveDisplayName(
  user: Pick<CurrentUser, "displayName" | "name" | "email">
): string {
  return user.displayName ?? user.name ?? user.email;
}

function parseHint(raw: string | null): SessionHint {
  if (raw === null) return ANONYMOUS;

  // "1" is what every browser that visited before this field existed still has
  // stored. It means authenticated with no identity, which is exactly the
  // previous behaviour — the header falls back to its generic control for one
  // load and the next write upgrades the entry.
  if (raw === "1") {
    return { isAuthenticated: true, displayName: null, avatarUrl: null };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) return ANONYMOUS;

    const { displayName, avatarUrl } = parsed as Record<string, unknown>;

    return {
      isAuthenticated: true,
      displayName: typeof displayName === "string" ? displayName : null,
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl : null,
    };
  } catch {
    // Anything unparseable is treated as no hint at all rather than as a
    // signed-out answer: this store is a guess, and a corrupted guess should
    // fall back to "don't know", which is what ANONYMOUS means to the header.
    return ANONYMOUS;
  }
}

// useSyncExternalStore calls getSnapshot on every render and bails out only on
// Object.is equality, so parsing fresh on each call would hand it a new object
// every time and spin. The raw string is the identity that matters, so the
// parsed result is memoised against it.
let cachedRaw: string | null = null;
let cachedHint: SessionHint = ANONYMOUS;

export function readSessionHint(): SessionHint {
  return safely(() => {
    const raw = window.localStorage.getItem(SESSION_HINT_KEY);

    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedHint = parseHint(raw);
    }

    return cachedHint;
  }, ANONYMOUS);
}

/** The server snapshot, and the fallback when localStorage is unreadable. Stable by reference. */
export function anonymousSessionHint(): SessionHint {
  return ANONYMOUS;
}

export function writeSessionHint(
  isAuthenticated: boolean,
  user: CurrentUser | null
): void {
  safely(() => {
    if (!isAuthenticated) {
      // Cleared on every unauthenticated answer, which is what makes logout propagate: the logout
      // action refreshes the provider, /api/me comes back unauthenticated, and the hint goes with it.
      window.localStorage.removeItem(SESSION_HINT_KEY);
      return;
    }

    // A signed-in visitor whose profile call failed is authenticated without a resolved profile.
    // Storing the boolean alone keeps the header's shape correct and lets the next successful load
    // fill the identity back in — writing an empty identity here would erase a good one.
    window.localStorage.setItem(
      SESSION_HINT_KEY,
      user
        ? JSON.stringify({
            displayName: resolveDisplayName(user),
            avatarUrl: user.avatarUrl,
          })
        : "1"
    );
  }, undefined);
}

/**
 * Notifies when another tab changes the hint. `storage` only fires in *other* tabs, which is
 * exactly the case worth reacting to: this tab already knows about its own writes, and a sign-out
 * somewhere else would otherwise leave every open tab showing an account menu for a dead session.
 */
export function subscribeToSessionHint(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === SESSION_HINT_KEY) onChange();
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
