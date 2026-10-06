"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import {
  LanguageSwitcherView,
  type LocaleCode,
} from "@/components/LanguageSwitcherView";

const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function AdminLanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function handleSelect(code: LocaleCode) {
    if (code === locale) return;

    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.refresh();
  }

  return <LanguageSwitcherView locale={locale} onSelect={handleSelect} />;
}
