"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, LogOut } from "lucide-react";

import NextLink from "next/link";

import { useRouter } from "@/i18n/routing";
import { logoutAction } from "@/features/auth/actions/auth-actions";
import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";

import type { HeaderIdentity } from "@/features/auth/components/CurrentUserProvider";

interface AdminHeaderActionsProps {
  redirectTo?: string;
  identity?: HeaderIdentity;
}

export function AdminHeaderActions({ redirectTo, identity }: AdminHeaderActionsProps) {
  const router = useRouter();
  const { refresh: refreshCurrentUser } = useCurrentUser();
  const t = useTranslations("Auth");
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  function handleLogout() {
    setIsMenuOpen(false);
    startTransition(async () => {
      await logoutAction(redirectTo);
      refreshCurrentUser();
      router.refresh();
    });
  }

  if (!identity) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        aria-label={t("signOut")}
        className="flex shrink-0 items-center gap-2 rounded-full bg-secondary px-2.5 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-input disabled:opacity-50 sm:px-4"
      >
        <LogOut className="size-4 shrink-0" />
        <span className="hidden sm:inline">{t("signOut")}</span>
      </button>
    );
  }

  const { displayName, avatarUrl } = identity;
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label={displayName}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className="flex items-center gap-2 rounded-full border border-input bg-secondary py-1 pr-0.5 pl-0.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-input sm:py-1.5 sm:pr-3 sm:pl-1.5"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
        <ChevronDown className="hidden size-3.5 shrink-0 text-muted-foreground sm:block" />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          aria-label={displayName}
          className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-border bg-popover p-1 shadow-xl"
        >
          <NextLink
            href="/admin/profile"
            role="menuitem"
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          >
            {t("profile")}
          </NextLink>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isPending}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
