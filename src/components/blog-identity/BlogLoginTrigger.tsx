"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogIn } from "lucide-react";

import { LoginModal } from "./LoginModal";

export function BlogLoginTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Auth");

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("loginButton")}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-2.5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03] sm:px-4"
      >
        <LogIn className="size-4 shrink-0" />
        <span className="hidden sm:inline">{t("loginButton")}</span>
      </button>
      <LoginModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
