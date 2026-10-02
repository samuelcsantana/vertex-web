import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
import { formatPostDate } from "@/features/posts/utils/format-post-date";

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
  const t = await getTranslations("Home");
  const tPost = await getTranslations("Post");

  const [featuredPost, ...restPosts] = posts;

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <section className="flex flex-col items-start gap-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-7xl">
          {t("heroTitleLine1")}
          <br />
          <span className="text-primary">
            {t("heroTitleLine2")}
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{t("heroDescription")}</p>
      </section>

      <HomeAdminPanel />

      {posts.length === 0 ? (
        <p className="mt-16 text-muted-foreground">{t("noPostsYet")}</p>
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
                <div className="group relative mt-16 grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-accent/80 hover:shadow-lg lg:grid-cols-2">
                  <div className="relative flex flex-col justify-center gap-4 p-8">
                    {/* Absolutely positioned so it never adds height to this
                        column — it used to sit in normal flex flow, which
                        reserved space even at opacity-0 and made the card
                        taller for admins than for anonymous visitors. */}
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

                    <h2 className="pointer-events-none line-clamp-2 text-2xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                      {displayTitle}
                    </h2>

                    <p className="pointer-events-none line-clamp-3 text-sm text-muted-foreground">
                      {excerpt}
                    </p>

                    <div className="pointer-events-none flex items-center gap-3 font-mono text-xs text-muted-foreground">
                      <time
                        dateTime={featuredPost.publishedAt ?? featuredPost.createdAt}
                        className="flex items-center gap-1.5"
                      >
                        <Calendar className="size-3.5" />
                        {formatPostDate(
                          featuredPost.publishedAt ?? featuredPost.createdAt,
                          locale
                        )}
                      </time>
                      <span className="size-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {readingMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* The cover keeps its own 1200×630 shape at every width. It
                      used to stretch to the text column's height from 640px
                      up, and object-cover then cut its sides: only 65% of the
                      width showed at 768px and 88% at 1024px. Side by side
                      only from lg, where the two columns are close in height,
                      centred if the text runs taller; stacked below that. */}
                  {displayCoverUrl && (
                    <div className="relative aspect-[1200/630] overflow-hidden lg:self-center">
                      <CoverImage
                        src={displayCoverUrl}
                        alt={displayCoverAlt ?? ""}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        priority
                        className="pointer-events-none size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-background/20 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent" />
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
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-accent/80 hover:shadow-lg"
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
                      <div className="pointer-events-none absolute inset-0 bg-background/20 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent" />
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

                    {/* Short date and nowrap items: at four columns this row is 202px wide,
                        and the long date pushed both items onto two lines each. */}
                    <div className="pointer-events-none mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-muted-foreground">
                      <time
                        dateTime={post.publishedAt ?? post.createdAt}
                        className="flex items-center gap-1 whitespace-nowrap"
                      >
                        <Calendar className="size-3.5" />
                        {formatPostDate(post.publishedAt ?? post.createdAt, locale, "short")}
                      </time>
                      <span className="size-1 rounded-full bg-muted-foreground/40" />
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Clock className="size-3.5" />
                        {readingMinutes} min
                      </span>
                    </div>

                    <h2 className="pointer-events-none line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                      {displayTitle}
                    </h2>

                    <p className="pointer-events-none mt-2 line-clamp-3 text-sm text-muted-foreground">
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
