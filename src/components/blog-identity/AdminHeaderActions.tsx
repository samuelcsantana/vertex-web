"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        Sair
      </button>
    );
  }

  const displayName = profile.name ?? profile.email;
  const initial = (profile.name?.trim()?.[0] ?? profile.email[0] ?? "?").toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 py-1.5 pr-3 pl-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external OAuth provider avatar, not worth a next/image remote-pattern allowlist entry
          <img
            src={profile.avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-400">
            {initial}
          </span>
        )}
        <span className="max-w-[10rem] truncate">{displayName}</span>
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-xl">
          <Link
            href="/dashboard/settings"
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800"
          >
            Perfil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
