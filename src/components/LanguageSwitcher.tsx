"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/routing";

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
  const router = useRouter();
  const pathname = usePathname();

  function handleSelect(code: (typeof LOCALES)[number]["code"]) {
    // A real navigation to the locale-prefixed URL (not a cookie flip), so
    // the [locale] segment re-renders end to end — <html lang>, messages,
    // and everything under it — instead of relying on a manual reload.
    router.replace(pathname, { locale: code });
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-slate-700 bg-slate-800/60 p-0.5 sm:gap-1 sm:p-1">
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => handleSelect(item.code)}
          aria-label={item.label}
          title={t(item.code)}
          aria-pressed={locale === item.code}
          className={`flex size-5 shrink-0 items-center justify-center rounded-full text-sm transition-colors sm:size-7 ${
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
