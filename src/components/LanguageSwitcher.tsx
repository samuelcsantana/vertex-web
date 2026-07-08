"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/routing";
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

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Locale");
  const router = useRouter();
  const pathname = usePathname();

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
