"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { LOCALE_COOKIE_NAME } from "@/i18n/config";

const LOCALES = [
  { code: "pt", flag: "🇧🇷", label: "Português" },
  { code: "en", flag: "🇺🇸", label: "English" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function handleSelect(code: string) {
    // Deliberately no "already selected" bail-out: `locale` here comes from
    // context and only updates once router.refresh() below resolves, so a
    // quick second click (different locale, before the first refresh
    // settles) would compare against a stale value and silently no-op.
    document.cookie = `${LOCALE_COOKIE_NAME}=${code}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 p-1">
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => handleSelect(item.code)}
          aria-label={item.label}
          aria-pressed={locale === item.code}
          className={`flex size-7 items-center justify-center rounded-full text-sm transition-colors ${
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
