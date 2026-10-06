import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BlogMobileNav } from "@/components/blog-identity/BlogMobileNav";

export function BlogHeaderShell({
  rightSlot,
  localeSwitcher = <LanguageSwitcher />,
  isAuthenticated,
  logoutRedirectTo,
}: {
  rightSlot: ReactNode;
  localeSwitcher?: ReactNode;
  isAuthenticated: boolean;
  logoutRedirectTo?: string;
}) {
  const t = useTranslations("Navigation");

  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        {t("skipToContent")}
      </a>
      <header className="sticky top-4 z-50 mx-auto w-full max-w-[calc(var(--container-6xl)+6rem)] px-4 sm:px-6">
        <div className="transform-gpu flex h-16 items-center justify-between gap-1 rounded-2xl border border-border bg-card/60 px-4 backdrop-blur-xl will-change-transform sm:gap-2 sm:px-6">
          <Link
            href="/"
            className="shrink-0 font-mono text-sm font-bold tracking-tight min-[400px]:text-base sm:text-lg"
          >
            <span className="text-primary">{"< "}</span>
            <span className="text-foreground">samuelsantana.dev</span>
            <span className="text-primary">{" />"}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            {localeSwitcher}
            <div className="hidden md:block">{rightSlot}</div>
            <BlogMobileNav
              navLinks={NAV_LINKS}
              isAuthenticated={isAuthenticated}
              logoutRedirectTo={logoutRedirectTo}
            />
          </div>
        </div>
      </header>
    </>
  );
}
