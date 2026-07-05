"use client";

import { Shield } from "lucide-react";

import { useBlogAdmin } from "./blog-admin-context";
import { BlogHeaderShell } from "./BlogHeaderShell";

export function BlogHeader() {
  const { isAdmin, openLogin, logout } = useBlogAdmin();

  return (
    <BlogHeaderShell
      rightSlot={
        isAdmin ? (
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
        )
      }
    />
  );
}
