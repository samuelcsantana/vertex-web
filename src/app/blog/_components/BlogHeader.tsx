"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

import { useBlogAdmin } from "./blog-admin-context";

const NAV_LINKS = [
  { href: "/blog", label: "Artigos" },
  { href: "#", label: "Sobre" },
];

export function BlogHeader() {
  const { isAdmin, openLogin, logout } = useBlogAdmin();

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-6 shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] backdrop-blur-xl">
        <Link
          href="/blog"
          className="font-mono text-lg font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {"< "}
          </span>
          <span className="text-white">samuel.dev</span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {" />"}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-400 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {isAdmin ? (
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
          >
            Sair
          </button>
        ) : (
          <button
            type="button"
            onClick={openLogin}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03]"
          >
            <Shield className="size-4" />
            Login (Mock)
          </button>
        )}
      </div>
    </header>
  );
}
