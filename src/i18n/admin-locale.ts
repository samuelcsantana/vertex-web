import { cookies } from "next/headers";
import { hasLocale, type Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

const LOCALE_COOKIE = "NEXT_LOCALE";

export async function resolveAdminLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;

  return hasLocale(routing.locales, stored) ? stored : routing.defaultLocale;
}

export async function applyAdminLocale(): Promise<Locale> {
  const locale = await resolveAdminLocale();

  setRequestLocale(locale);

  return locale;
}
