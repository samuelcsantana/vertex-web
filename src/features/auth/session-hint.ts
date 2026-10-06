import type { CurrentUser } from "@/features/auth/types";

const SESSION_HINT_KEY = "vertex.session-hint";

export interface SessionHint {
  isAuthenticated: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}

const ANONYMOUS: SessionHint = {
  isAuthenticated: false,
  displayName: null,
  avatarUrl: null,
};

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
    return ANONYMOUS;
  }
}

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

export function anonymousSessionHint(): SessionHint {
  return ANONYMOUS;
}

export function writeSessionHint(
  isAuthenticated: boolean,
  user: CurrentUser | null
): void {
  safely(() => {
    if (!isAuthenticated) {
      window.localStorage.removeItem(SESSION_HINT_KEY);
      return;
    }

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

export function subscribeToSessionHint(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === SESSION_HINT_KEY) onChange();
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
