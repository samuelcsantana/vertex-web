"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/routing";
import { useDialogBehavior } from "@/hooks/useDialogBehavior";
import { getLocalizedSlug } from "@/features/posts/utils/localized-content";
import type { Post } from "@/features/posts/types";

const API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL ?? "http://localhost:3333";

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

type LocaleCode = (typeof LOCALES)[number]["code"];

const POST_PATH_PATTERN = /^\/blog\/([^/]+)$/;

// Renders both header variants itself instead of letting the header pick:
// md+ shows all three locales side by side, <md shows only the current
// locale's flag with the options in a dropdown (the bar can't fit three
// flags next to the logo on phone widths). Keeping both in one component
// means the post fetch below runs once, not once per variant.
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Locale");
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useDialogBehavior(isMenuOpen, () => setIsMenuOpen(false));

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const postMatch = pathname.match(POST_PATH_PATTERN);
  const currentSlug = postMatch?.[1] ?? null;

  // A post can have a different slug per locale (SEO), so switching
  // language on a post page can't just re-prefix the current path like
  // every other page — /en/blog/{same-slug} might not exist, or might be a
  // *different* post. There's no static/compile-time way to resolve this
  // (next-intl's routing only knows fixed pathnames), so this fetches the
  // post from the already-public GET /posts/:slug endpoint and reads its
  // translated fields directly, rather than threading the data down
  // through BlogHeaderShell/BlogHeader (which live in the layout — a
  // sibling of the page in the tree, not an ancestor, so they can't
  // receive page-specific data via context or props without restructuring
  // the whole chrome).
  // Keyed by the slug it was fetched for, so a stale response from a post
  // page the user has since navigated away from (this component stays
  // mounted across /blog/[slug] navigations — see the (blog) route group's
  // shared layout.tsx note in CLAUDE.md) is never mistaken for the current
  // post's data, without needing a synchronous setState reset in the effect.
  const [fetchedPost, setFetchedPost] = useState<{
    slug: string;
    post: Post;
  } | null>(null);

  useEffect(() => {
    if (!currentSlug) return;
    const slug = currentSlug;

    let cancelled = false;

    async function loadPost() {
      try {
        const url = new URL(`${API_URL}/posts/${slug}`);
        url.searchParams.set("locale", locale);
        const response = await fetch(url);
        if (!response.ok) return;
        const data: Post = await response.json();
        if (!cancelled) setFetchedPost({ slug, post: data });
      } catch {
        // Network error — post stays null, and the click handler treats
        // an unresolved post as "don't navigate" rather than guessing.
      }
    }

    loadPost();
    return () => {
      cancelled = true;
    };
  }, [currentSlug, locale]);

  const post =
    fetchedPost && fetchedPost.slug === currentSlug ? fetchedPost.post : null;

  function handleSelect(code: LocaleCode) {
    setIsMenuOpen(false);

    if (currentSlug) {
      // getLocalizedSlug always falls back to post.slug (pt) when the
      // target locale has no translated slug of its own — pt is a
      // required field, so this always resolves to a real, reachable
      // slug. If post hasn't loaded yet, do nothing rather than guess.
      if (!post) return;

      const targetSlug = getLocalizedSlug(post, code);
      router.replace(`/blog/${targetSlug}`, { locale: code });
      return;
    }

    // A real navigation to the locale-prefixed URL (not a cookie flip), so
    // the [locale] segment re-renders end to end — <html lang>, messages,
    // and everything under it — instead of relying on a manual reload.
    router.replace(pathname, { locale: code });
  }

  const current = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];

  return (
    <>
      <div className="hidden shrink-0 items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 p-1 md:flex">
        {LOCALES.map((item) => (
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
            {LOCALES.map((item) => (
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
