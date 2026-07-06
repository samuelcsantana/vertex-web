import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BlogMobileNav } from "@/components/blog-identity/BlogMobileNav";

export function BlogHeaderShell({ rightSlot }: { rightSlot: ReactNode }) {
  const t = useTranslations("Navigation");

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
  ];

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex h-16 items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] backdrop-blur-xl sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-mono text-lg font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {"< "}
          </span>
          <span className="text-white">samuel.dev</span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {" />"}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          {rightSlot}
          <BlogMobileNav navLinks={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
