"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import {
  LanguageSwitcherView,
  type LocaleCode,
} from "@/components/LanguageSwitcherView";

// next-intl's own cookie, and its own defaults for it: one year, site-wide
// path, Lax. Matching them matters because the public site's middleware writes
// this same cookie — a different path or lifetime here would leave the two
// halves of the app disagreeing about the language depending on which one you
// visited last.
const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * The admin panel's language picker.
 *
 * The public switcher navigates, because there a language is a different URL.
 * Admin URLs carry no locale, so there is nothing to navigate to: the choice is
 * written to the cookie the server reads (see i18n/admin-locale.ts) and the
 * server tree is asked to re-render.
 *
 * `router.refresh()` rather than `location.reload()`: the whole admin subtree
 * is server-rendered, so a refresh re-runs it with the new cookie and swaps the
 * result in, keeping client state — an open form with unsaved text in it, most
 * of all — instead of throwing the page away.
 */
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
