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

export interface HeaderIdentity {
  displayName: string;
  avatarUrl: string | null;
}

interface CurrentUserContextValue {
  user: CurrentUser | null;
  identity: HeaderIdentity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isResolved: boolean;
  refresh: () => void;
}

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

function subscribeToHydration(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

export function CurrentUserProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isResolved = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  const hint = useSyncExternalStore(
    subscribeToSessionHint,
    readSessionHint,
    anonymousSessionHint
  );

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [serverAnswer, setServerAnswer] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        writeSessionHint(authenticated, data.user ?? null);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [reloadToken]);

  const isAuthenticated = serverAnswer ?? hint.isAuthenticated;

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
