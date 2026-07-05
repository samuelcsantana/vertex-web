"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

import { LoginModal } from "./LoginModal";

export function BlogLoginTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03]"
      >
        <Shield className="size-4" />
        Login
      </button>
      <LoginModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
