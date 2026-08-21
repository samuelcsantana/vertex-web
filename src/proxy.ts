import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// The gated panel lives at one fixed prefix, outside the [locale] segment.
// It used to live inside it, which meant this file had to undo next-intl's
// URL scheme before it could ask its own question: "as-needed" gives the
// default locale no prefix, so /dashboard, /en/dashboard and /es/dashboard
// were three spellings of one route and the gate needed ~20 lines to strip
// the prefix back off before matching. A panel read by one signed-in person
// never needed a crawlable URL per language — it picks its language from a
// cookie instead (see i18n/admin-locale.ts), which leaves this a prefix
// check.
const ADMIN_PREFIX = "/admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) {
    // Cookie presence only. The role check needs to decode the JWT, which is
    // a network round trip this edge cannot afford — admin/dashboard/layout.tsx
    // is the real gate.
    if (!request.cookies.get("access_token")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Deliberately not handed to next-intl: these URLs carry no locale, and
    // routing them through it would only prefix them with one that means
    // nothing here.
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  // embed-demo and micro-frontends are technical demos with their own root layout and no localized
  // twin — routing them through next-intl would only prefix them with a locale that means nothing.
  // admin is matched (the gate above needs to see it) but never reaches next-intl.
  matcher: ["/((?!api|embed-demo|micro-frontends|_next|_vercel|.*\\..*).*)"],
};
