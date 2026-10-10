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

const EXCERPT_LENGTH = 180;
const FEATURED_POSITION = 1;

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
                    <PostAdminActions
                      postId={featuredPost.id}
                      className="absolute right-8 top-8 z-10"
                    />

                    <TopicPills topics={featuredPost.topics} className="pointer-events-none" />

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      title={displayTitle}
                      data-track-event="article_card_clicked"
                      data-track-post={featuredPost.slug}
                      data-track-position={FEATURED_POSITION}
                      data-track-locale={locale}
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
            {restPosts.map((post, index) => {
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
                        sizes="(min-width: 1280px) 252px, (min-width: 1024px) 346px, (min-width: 640px) 50vw, 100vw"
                        className="pointer-events-none size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-background/20 mix-blend-overlay transition-colors duration-500 group-hover:bg-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <PostAdminActions postId={post.id} className="mb-4" />

                    <Link
                      href={`/blog/${post.slug}`}
                      title={displayTitle}
                      data-track-event="article_card_clicked"
                      data-track-post={post.slug}
                      data-track-position={FEATURED_POSITION + 1 + index}
                      data-track-locale={locale}
                      className="absolute inset-0 rounded-3xl"
                    >
                      <span className="sr-only">
                        {tPost("readPost", { title: displayTitle })}
                      </span>
                    </Link>

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
