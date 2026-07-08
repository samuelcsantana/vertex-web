import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BlogMobileNav } from "@/components/blog-identity/BlogMobileNav";

export function BlogHeaderShell({ rightSlot }: { rightSlot: ReactNode }) {
  const t = useTranslations("Navigation");

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-emerald-400 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        {t("skipToContent")}
      </a>
      <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* transform-gpu forces this blurred layer onto its own GPU
            compositing layer instead of being recomposited inline with the
            page as it scrolls — some mobile browsers (older Samsung Internet
            in particular) smear/haze backdrop-blur during scroll without
            this hint. Unverified on the actual device that reported it. */}
        <div className="transform-gpu flex h-16 items-center justify-between gap-1 rounded-2xl border border-white/10 bg-slate-900/60 px-4 shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] backdrop-blur-xl will-change-transform sm:gap-2 sm:px-6">
          <Link
            href="/"
            className="shrink-0 font-mono text-base font-bold tracking-tight sm:text-lg"
          >
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {"< "}
            </span>
            <span className="text-white">samuelsantana.dev</span>
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

          <div className="flex items-center gap-1 sm:gap-3">
            <LanguageSwitcher />
            {rightSlot}
            <BlogMobileNav navLinks={NAV_LINKS} />
          </div>
        </div>
      </header>
    </>
  );
}
