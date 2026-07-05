"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { logoutAction } from "@/features/auth/actions/auth-actions";

interface AdminHeaderActionsProps {
  // When omitted, logging out simply re-renders the current page instead
  // of navigating away — used on public pages (home, post reading) where
  // there's nothing forcing the visitor off the page once logged out.
  redirectTo?: string;
}

export function AdminHeaderActions({ redirectTo }: AdminHeaderActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction(redirectTo);
      router.refresh();
    });
  }

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
