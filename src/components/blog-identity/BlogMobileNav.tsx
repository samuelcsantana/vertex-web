"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface BlogMobileNavProps {
  navLinks: { href: string; label: string }[];
}

export function BlogMobileNav({ navLinks }: BlogMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Navigation");

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
          {/* On <md the switcher only exists here — BlogHeaderShell hides
              its bar instance because it doesn't fit on phone widths. */}
          <div className="mt-1 flex justify-center border-t border-white/10 px-3 pt-3 pb-1">
            <LanguageSwitcher onSelect={() => setIsOpen(false)} />
          </div>
        </nav>
      )}
    </div>
  );
}
