"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";

import { LoginModal } from "./LoginModal";

export function BlogLoginTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Auth");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-2.5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03] sm:px-4"
      >
        <Shield className="size-4" />
        <span className="hidden sm:inline">{t("loginButton")}</span>
      </button>
      <LoginModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
