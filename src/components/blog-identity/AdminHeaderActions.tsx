"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, LogOut } from "lucide-react";

import { Link, useRouter } from "@/i18n/routing";
import { logoutAction } from "@/features/auth/actions/auth-actions";

interface AdminHeaderActionsProfile {
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

interface AdminHeaderActionsProps {
  // When omitted, logging out simply re-renders the current page instead
  // of navigating away — used on public pages (home, post reading) where
  // there's nothing forcing the visitor off the page once logged out.
  redirectTo?: string;
  // Optional: the profile fetch can come back empty (backend hiccup) even
  // with a valid session cookie, so this degrades to a plain "Sair" button
  // rather than blocking logout.
  profile?: AdminHeaderActionsProfile;
}

export function AdminHeaderActions({ redirectTo, profile }: AdminHeaderActionsProps) {
  const router = useRouter();
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
      router.refresh();
    });
  }

  if (!profile) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        aria-label={t("signOut")}
        className="flex shrink-0 items-center gap-2 rounded-full bg-slate-800 px-2.5 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50 sm:px-4"
      >
        <LogOut className="size-4 shrink-0" />
        <span className="hidden sm:inline">{t("signOut")}</span>
      </button>
    );
  }

  const displayName = profile.name ?? profile.email;
  const initial = (profile.name?.trim()?.[0] ?? profile.email[0] ?? "?").toUpperCase();

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label={displayName}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-1 pr-0.5 pl-0.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 sm:py-1.5 sm:pr-3 sm:pl-1.5"
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external OAuth provider avatar, not worth a next/image remote-pattern allowlist entry
          <img
            src={profile.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-400">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate sm:inline">{displayName}</span>
        <ChevronDown className="hidden size-3.5 shrink-0 text-slate-400 sm:block" />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          aria-label={displayName}
          className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-xl"
        >
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
          >
            {t("profile")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={isPending}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
