"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { useDialogBehavior } from "@/hooks/useDialogBehavior";

export const LOCALE_OPTIONS = [
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
] as const;

export type LocaleCode = (typeof LOCALE_OPTIONS)[number]["code"];

export function LanguageSwitcherView({
  locale,
  onSelect,
}: {
  locale: string;
  onSelect: (code: LocaleCode) => void;
}) {
  const t = useTranslations("Locale");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useDialogBehavior(isMenuOpen, () => setIsMenuOpen(false));

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  function handleSelect(code: LocaleCode) {
    setIsMenuOpen(false);
    onSelect(code);
  }

  const current =
    LOCALE_OPTIONS.find((item) => item.code === locale) ?? LOCALE_OPTIONS[0];

  return (
    <>
      <div className="hidden shrink-0 items-center gap-1 rounded-full border border-input bg-secondary/60 p-1 md:flex">
        {LOCALE_OPTIONS.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => handleSelect(item.code)}
            aria-label={item.label}
            title={t(item.code)}
            aria-pressed={locale === item.code}
            className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm transition-colors ${
              locale === item.code
                ? "bg-primary/20 ring-1 ring-primary/40"
                : "opacity-50 hover:opacity-100"
            }`}
          >
            {item.flag}
          </button>
        ))}
      </div>

      <div ref={wrapperRef} className="relative shrink-0 md:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={t("changeLanguage")}
          title={t("changeLanguage")}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          className="flex size-8 items-center justify-center rounded-full border border-input bg-secondary/60 text-sm transition-colors hover:bg-input"
        >
          {current.flag}
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label={t("changeLanguage")}
            className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-border bg-popover p-1 shadow-xl"
          >
            {LOCALE_OPTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                role="menuitemradio"
                aria-checked={locale === item.code}
                onClick={() => handleSelect(item.code)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                  locale === item.code ? "text-primary" : "text-foreground"
                }`}
              >
                <span aria-hidden="true">{item.flag}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
