import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

import { Link, routing } from "@/i18n/routing";
import { HomeAdminPanel } from "@/features/posts/components/HomeAdminPanel";
import { PostAdminActions } from "@/features/posts/components/PostAdminActions";
import { getPosts } from "@/features/posts/api/post-service";
import { CoverImage } from "@/features/posts/components/CoverImage";
import { TopicPills } from "@/features/posts/components/TopicPills";
import type { Post } from "@/features/posts/types";
import {
  getLocalizedContent,
  getLocalizedCoverAlt,
  getLocalizedCoverUrl,
  getLocalizedTitle,
} from "@/features/posts/utils/localized-content";
import { stripMarkdown } from "@/features/posts/utils/strip-markdown";
import { estimateReadingMinutes } from "@/features/posts/utils/estimate-reading-time";

// Bounded to a sane line-clamp length for the visible teaser text.
const EXCERPT_LENGTH = 180;

function getFullText(post: Post, locale: string): string {
  return stripMarkdown(getLocalizedContent(post, locale));
}

function getExcerpt(post: Post, locale: string): string {
  const stripped = getFullText(post, locale);
  return stripped.length > EXCERPT_LENGTH
    ? `${stripped.slice(0, EXCERPT_LENGTH).trimEnd()}…`
    : stripped;
}

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Required by next-intl for this page to be prerendered: without it every
  // getTranslations call below resolves the locale from the request headers
  // and the page falls back to per-request rendering.
  setRequestLocale(locale);

  const posts = await getPosts();
  const dateLocale = locale === "en" ? enUS : ptBR;
  const t = await getTranslations("Home");
  const tPost = await getTranslations("Post");

  const [featuredPost, ...restPosts] = posts;

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <section className="flex flex-col items-start gap-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          {t("heroTitleLine1")}
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            {t("heroTitleLine2")}
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">{t("heroDescription")}</p>
      </section>

      <HomeAdminPanel />

      {posts.length === 0 ? (
        <p className="mt-16 text-slate-400">{t("noPostsYet")}</p>
      ) : (
        <>
          {featuredPost &&
            (() => {
              const displayTitle = getLocalizedTitle(featuredPost, locale);
              const displayCoverUrl = getLocalizedCoverUrl(featuredPost, locale);
              const displayCoverAlt = getLocalizedCoverAlt(featuredPost, locale);
              const excerpt = getExcerpt(featuredPost, locale);
              const readingMinutes = estimateReadingMinutes(
                getLocalizedContent(featuredPost, locale)
              );

              return (
                <div className="group relative mt-16 grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/5 sm:grid-cols-2">
                  <div className="relative flex flex-col justify-center gap-4 p-8">
                    {/* Absolutely positioned so it never adds height to this
                        column — it used to sit in normal flex flow, which
                        reserved space even at opacity-0 and made the image
                        column (sm:h-full, matched to this column's height
                        via grid stretch) crop taller/differently for admins
                        than for anonymous visitors. */}
                    <PostAdminActions
                      postId={featuredPost.id}
                      className="absolute right-8 top-8 z-10"
                    />

                    <TopicPills topics={featuredPost.topics} className="pointer-events-none" />

                    {/* title lives here, not on the h2 below — that's
                        pointer-events-none so clicks fall through to this
                        full-card link, which means it's also invisible to
                        the browser's native hover-tooltip engine. This Link
                        is the one element that actually receives the
                        hover, so it's the one that has to carry it. */}
                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      title={displayTitle}
                      className="absolute inset-0"
                    >
                      <span className="sr-only">
                        {tPost("readPost", { title: displayTitle })}
                      </span>
                    </Link>

                    <h2 className="pointer-events-none line-clamp-2 text-2xl font-bold text-slate-100 transition-colors group-hover:text-emerald-400 sm:text-3xl">
                      {displayTitle}
                    </h2>

                    <p className="pointer-events-none line-clamp-3 text-sm text-slate-400">
                      {excerpt}
                    </p>

                    <div className="pointer-events-none flex items-center gap-3 font-mono text-xs text-slate-400">
                      <time
                        dateTime={featuredPost.publishedAt ?? featuredPost.createdAt}
                        className="flex items-center gap-1.5"
                      >
                        <Calendar className="size-3.5" />
                        {format(
                          parseISO(featuredPost.publishedAt ?? featuredPost.createdAt),
                          "MMMM d, yyyy",
                          { locale: dateLocale }
                        )}
                      </time>
                      <span className="size-1 rounded-full bg-slate-700" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {readingMinutes} min
                      </span>
                    </div>
                  </div>

                  {displayCoverUrl && (
                    <div className="relative overflow-hidden sm:h-full">
                      <CoverImage
                        src={displayCoverUrl}
                        alt={displayCoverAlt ?? ""}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        priority
                        className="pointer-events-none aspect-[1200/630] size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:aspect-auto"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-slate-950/20 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent" />
                    </div>
                  )}
                </div>
              );
            })()}

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {restPosts.map((post) => {
              const displayTitle = getLocalizedTitle(post, locale);
              const displayCoverUrl = getLocalizedCoverUrl(post, locale);
              const displayCoverAlt = getLocalizedCoverAlt(post, locale);
              const excerpt = getExcerpt(post, locale);
              const readingMinutes = estimateReadingMinutes(
                getLocalizedContent(post, locale)
              );

              return (
                <div
                  key={post.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  {displayCoverUrl && (
                    <div className="relative aspect-[1200/630] overflow-hidden">
                      <CoverImage
                        src={displayCoverUrl}
                        alt={displayCoverAlt ?? ""}
                        // The grid's real column widths inside max-w-6xl: 4 cols
                        // ≥xl, 3 ≥lg, 2 ≥sm, full width below.
                        sizes="(min-width: 1280px) 252px, (min-width: 1024px) 346px, (min-width: 640px) 50vw, 100vw"
                        className="pointer-events-none size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-slate-950/20 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <PostAdminActions postId={post.id} className="mb-4" />

                    {/* title lives here, not on the h2/p below — see the
                        same note on the featured card above. */}
                    <Link
                      href={`/blog/${post.slug}`}
                      title={displayTitle}
                      className="absolute inset-0 rounded-3xl"
                    >
                      <span className="sr-only">
                        {tPost("readPost", { title: displayTitle })}
                      </span>
                    </Link>

                    <div className="pointer-events-none mb-2 flex items-center gap-2.5 font-mono text-xs text-slate-400">
                      <time
                        dateTime={post.publishedAt ?? post.createdAt}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="size-3.5" />
                        {format(
                          parseISO(post.publishedAt ?? post.createdAt),
                          "MMMM d, yyyy",
                          { locale: dateLocale }
                        )}
                      </time>
                      <span className="size-1 rounded-full bg-slate-700" />
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {readingMinutes} min
                      </span>
                    </div>

                    <h2 className="pointer-events-none line-clamp-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-emerald-400">
                      {displayTitle}
                    </h2>

                    <p className="pointer-events-none mt-2 line-clamp-3 text-sm text-slate-400">
                      {excerpt}
                    </p>

                    <TopicPills
                      topics={post.topics}
                      limit={2}
                      className="pointer-events-none mt-3"
                    />
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
