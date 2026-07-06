"use client";

import { useLocale, useTranslations } from "next-intl";

import { LOCALE_COOKIE_NAME } from "@/i18n/config";

// Endonyms (each language's own name for itself) — shown as the accessible
// name regardless of the current UI language, since that's the convention
// users expect from a language picker (recognizable even if you can't read
// the currently active language). The Locale message namespace still gets
// used below for the tooltip, translated into whatever the current UI
// language is.
const LOCALES = [
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Locale");

  function handleSelect(code: string) {
    document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=31536000`;
    // A hard reload (not router.refresh()) is deliberate here: this is what
    // makes the server re-render <html lang> for real, which is what
    // triggers the browser's own native-translate prompt for visitors — a
    // soft client-side refresh leaves stale DOM around that can conflict
    // with in-place mutations from browser/extension translators, which
    // React's reconciliation then trips over on the next re-render.
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-slate-700 bg-slate-800/60 p-0.5 sm:gap-1 sm:p-1">
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => handleSelect(item.code)}
          aria-label={item.label}
          title={t(item.code)}
          aria-pressed={locale === item.code}
          className={`flex size-6 items-center justify-center rounded-full text-sm transition-colors sm:size-7 ${
            locale === item.code
              ? "bg-emerald-500/20 ring-1 ring-emerald-500/40"
              : "opacity-50 hover:opacity-100"
          }`}
        >
          {item.flag}
        </button>
      ))}
    </div>
  );
}
