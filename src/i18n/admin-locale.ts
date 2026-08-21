import { cookies } from "next/headers";
import { hasLocale, type Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

/**
 * How the admin panel picks a language, now that its URLs carry no locale.
 *
 * The public site puts the locale in the path because search engines need one
 * crawlable URL per language. The admin has the opposite requirement: it is
 * gated, `noindex`, and read by one person, so a locale segment bought nothing
 * and cost a routing layer on every one of its routes.
 *
 * The cookie is next-intl's own `NEXT_LOCALE`, the same one its middleware
 * writes when a visitor picks a language on the public site — so arriving in
 * the dashboard keeps whatever language you were already reading in, without a
 * second preference to set or keep in sync.
 */
const LOCALE_COOKIE = "NEXT_LOCALE";

export async function resolveAdminLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;

  return hasLocale(routing.locales, stored) ? stored : routing.defaultLocale;
}

/**
 * Resolves the locale and publishes it to next-intl for this request.
 *
 * Every admin layout and page calls this, not just the root layout, and that
 * repetition is deliberate: layouts and pages render concurrently, so a page
 * can ask for the locale before its layout has cached one. Under `[locale]`
 * that race showed up as routes silently falling back to reading headers and
 * dropping out of the prerender. Here it would show up as a page rendering in
 * Portuguese inside a layout rendering in English — quieter, and worse.
 *
 * `cookies()` makes every caller per-request, which is what the admin already
 * is: it shows one person their own data and is declared `force-dynamic` for
 * that reason. Nothing prerendered reaches this module.
 */
export async function applyAdminLocale(): Promise<Locale> {
  const locale = await resolveAdminLocale();

  setRequestLocale(locale);

  return locale;
}
