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

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const postMatch = pathname.match(POST_PATH_PATTERN);
  const currentSlug = postMatch?.[1] ?? null;

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
      if (!post) return;

      const targetSlug = getLocalizedSlug(post, code);
      router.replace(`/blog/${targetSlug}`, { locale: code });
      return;
    }

    router.replace(pathname, { locale: code });
  }

  return <LanguageSwitcherView locale={locale} onSelect={handleSelect} />;
}
