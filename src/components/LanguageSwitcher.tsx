"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/routing";
import {
  LOCALE_OPTIONS,
  LanguageSwitcherView,
  type LocaleCode,
} from "@/components/LanguageSwitcherView";
import { getLocalizedSlug } from "@/features/posts/utils/localized-content";
import type { Post } from "@/features/posts/types";

const API_URL = process.env.NEXT_PUBLIC_VERTEX_API_URL ?? "http://localhost:3333";

const POST_PATH_PATTERN = /^\/blog\/([^/]+)$/;

/**
 * The public site's language picker, where a language *is* a URL.
 *
 * The admin panel's URLs carry no locale, so it uses AdminLanguageSwitcher
 * instead; the markup both render is in LanguageSwitcherView.
 */
export function LanguageSwitcher() {
  const locale = useLocale();
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
  // mounted across /blog/[slug] navigations, because the (blog) route group's
  // shared layout.tsx renders it above the page) is never mistaken for the current
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
        // The slug in the URL isn't necessarily the current locale's own —
        // a shared link re-prefixed by locale detection can land e.g. a pt
        // slug under /en (see the post page's cross-locale handling), and
        // GET /posts/:slug only matches the requested locale's slug. Try
        // the current locale first, then the others; any hit returns the
        // full post with every locale's slug fields, which is all
        // handleSelect needs.
        const localesToTry = [
          locale,
          ...LOCALE_OPTIONS.map((item) => item.code).filter(
            (code) => code !== locale
          ),
        ];

        for (const candidate of localesToTry) {
          const url = new URL(`${API_URL}/posts/${slug}`);
          url.searchParams.set("locale", candidate);
          const response = await fetch(url);
          if (!response.ok) continue;
          const data: Post = await response.json();
          if (!cancelled) setFetchedPost({ slug, post: data });
          return;
        }
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

  return <LanguageSwitcherView locale={locale} onSelect={handleSelect} />;
}
