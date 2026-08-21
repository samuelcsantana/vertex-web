"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { useDialogBehavior } from "@/hooks/useDialogBehavior";

// Endonyms (each language's own name for itself) — shown as the accessible
// name regardless of the current UI language, since that's the convention
// users expect from a language picker (recognizable even if you can't read
// the currently active language). The Locale message namespace still gets
// used below for the tooltip, translated into whatever the current UI
// language is.
export const LOCALE_OPTIONS = [
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
] as const;

export type LocaleCode = (typeof LOCALE_OPTIONS)[number]["code"];

/**
 * The picker's markup and open/close behaviour, with no opinion on what
 * switching a language does.
 *
 * That question has two answers in this app and they are not variations of one
 * another: on the public site a language is a different URL, so switching is a
 * navigation; in the admin panel the URLs carry no locale at all, so switching
 * is a stored preference. Keeping the shared half here means the two callers
 * differ only where they genuinely differ, instead of one of them growing a
 * mode flag through code that has nothing to do with routing.
 *
 * Renders both header variants itself rather than letting the header pick:
 * md+ shows all three locales side by side, <md shows only the current locale's
 * flag with the options in a dropdown (the bar can't fit three flags next to
 * the logo on phone widths).
 */
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
      <div className="hidden shrink-0 items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 p-1 md:flex">
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
                ? "bg-emerald-500/20 ring-1 ring-emerald-500/40"
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
          className="flex size-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 text-sm transition-colors hover:bg-slate-700"
        >
          {current.flag}
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label={t("changeLanguage")}
            className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-800 bg-slate-900 p-1 shadow-xl"
          >
            {LOCALE_OPTIONS.map((item) => (
              <button
                key={item.code}
                type="button"
                role="menuitemradio"
                aria-checked={locale === item.code}
                onClick={() => handleSelect(item.code)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-slate-800 ${
                  locale === item.code ? "text-emerald-400" : "text-slate-200"
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
