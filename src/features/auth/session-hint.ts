/**
 * A local, non-authoritative record of whether this browser was signed in last time.
 *
 * Why this exists: the public pages are prerendered, so the HTML every visitor receives is
 * identical and cannot know who is asking. The header therefore had to assume something before
 * /api/me answered, and it assumed "signed out" — which is right for every visitor except the one
 * person who is signed in, who saw the logged-out header flash on every load.
 *
 * The hint removes the guess without putting auth back into the render path. It is deliberately
 * NOT a credential and grants nothing: it is a boolean in localStorage, readable and forgeable by
 * any script on this origin, and the only thing it decides is which UI to paint for the ~200ms
 * before the real answer arrives. Gating anything on it would be a security bug; /api/me remains
 * the only source of truth, and it overwrites this on every load.
 *
 * localStorage rather than a cookie because it never needs to reach the server — sending it would
 * add bytes to every request to answer a question the server already answers better.
 */
const SESSION_HINT_KEY = "vertex.session-hint";

/** Safari in private mode throws on localStorage access, so every call is guarded. */
function safely<T>(operation: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    return operation();
  } catch {
    return fallback;
  }
}

export function readSessionHint(): boolean {
  return safely(() => window.localStorage.getItem(SESSION_HINT_KEY) === "1", false);
}

export function writeSessionHint(isAuthenticated: boolean): void {
  safely(() => {
    if (isAuthenticated) {
      window.localStorage.setItem(SESSION_HINT_KEY, "1");
    } else {
      // Cleared on every unauthenticated answer, which is what makes logout propagate: the logout
      // action refreshes the provider, /api/me comes back unauthenticated, and the hint goes with it.
      window.localStorage.removeItem(SESSION_HINT_KEY);
    }
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
