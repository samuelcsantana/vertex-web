"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { LogIn, LogOut, Menu, User, X } from "lucide-react";

import { Link, useRouter } from "@/i18n/routing";
import { logoutAction } from "@/features/auth/actions/auth-actions";
import { LoginModal } from "./LoginModal";

interface BlogMobileNavProps {
  navLinks: { href: string; label: string }[];
  // Below md the header hides its rightSlot (login trigger / account
  // actions), so this menu is where those actions live on phones.
  isAuthenticated: boolean;
  // Same contract as AdminHeaderActions/logoutAction: omitted on public
  // pages so the visitor stays put after signing out, set on admin pages
  // that can't be rendered once signed out.
  logoutRedirectTo?: string;
}

export function BlogMobileNav({
  navLinks,
  isAuthenticated,
  logoutRedirectTo,
}: BlogMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("Navigation");
  const tAuth = useTranslations("Auth");

  function handleLogout() {
    setIsOpen(false);
    startTransition(async () => {
      await logoutAction(logoutRedirectTo);
      router.refresh();
    });
  }

  return (
    <div className="shrink-0 md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={isOpen}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 text-slate-300 transition-colors hover:text-white"
      >
        {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {isOpen && (
        <nav className="absolute inset-x-4 top-20 z-50 flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-1">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <User className="size-4" aria-hidden="true" />
                  {tAuth("profile")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {tAuth("signOut")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsLoginOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <LogIn className="size-4" aria-hidden="true" />
                {tAuth("loginButton")}
              </button>
            )}
          </div>
        </nav>
      )}

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
