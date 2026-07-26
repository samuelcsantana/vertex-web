import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  FileText,
  Hash,
  List,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

import { Link, routing } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
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
import { getProfile } from "@/features/auth/api/profile-service";

// Bounded to a sane line-clamp length for the visible teaser text — the
// full plain-text article (getFullText below) is what the hover tooltip
// shows instead, since a listing card obviously can't fit the whole thing.
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

  // Cookie presence alone only proves "logged in", not "admin" — any Google
  // account can sign in since GoogleStrategy auto-provisions unknown emails
  // (role defaults to "user" unless it matches ADMIN_EMAIL). This card and
  // the per-post edit/delete controls below must gate on the real role.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;
  const isAdmin = profile?.role === "admin";
  const posts = await getPosts();
  const dateLocale = locale === "en" ? enUS : ptBR;
  const t = await getTranslations("Home");
  const tPost = await getTranslations("Post");

  // Shared between the featured card and the grid so the edit/delete
  // overlay (hover-revealed, admin-only) isn't copy-pasted across both
  // layouts — same controls, same confirm dialog, just a different card
  // shape around them.
  function renderAdminActions(post: Post) {
    return (
      <div className="relative z-10 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <Link
          href={`/dashboard/posts/${post.id}/edit`}
          aria-label={t("editArticle")}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400"
        >
          <Pencil className="size-3.5" />
          {t("editArticle")}
        </Link>
        <ConfirmDialog
          title={t("confirmDeleteTitle")}
          description={t("confirmDeleteDescription")}
          confirmLabel={t("confirmContinue")}
          action={deletePostAction.bind(null, post.id)}
          trigger={
            <button
              type="button"
              aria-label={t("deleteArticle")}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
            >
              <Trash2 className="size-3.5" />
              {t("deleteArticle")}
            </button>
          }
        />
      </div>
    );
  }

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

      {isAdmin && (
        <div className="relative z-10 mt-10 -mb-8 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
              <Settings className="size-4" />
            </div>
            <p className="text-sm font-medium text-white">{t("adminPanelActive")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/posts/new"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-200"
            >
              <Plus className="size-3.5" />
              {t("newArticle")}
            </Link>
            <Link
              href="/dashboard/posts"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <List className="size-3.5" />
              {t("managePosts")}
            </Link>
            <Link
              href="/dashboard/topics"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Hash className="size-3.5" />
              {t("topics")}
            </Link>
            <Link
              href="/dashboard/about"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <FileText className="size-3.5" />
              {t("editAbout")}
            </Link>
            <Link
              href="/dashboard/users"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Users className="size-3.5" />
              {t("manageUsers")}
            </Link>
          </div>
        </div>
      )}

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
              const fullText = getFullText(featuredPost, locale);
              const readingMinutes = estimateReadingMinutes(
                getLocalizedContent(featuredPost, locale)
              );

              return (
                <div className="group relative mt-16 grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/5 sm:grid-cols-2">
                  <div className="flex flex-col justify-center gap-4 p-8">
                    {isAdmin && renderAdminActions(featuredPost)}

                    <TopicPills topics={featuredPost.topics} className="pointer-events-none" />

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="absolute inset-0"
                    >
                      <span className="sr-only">
                        {tPost("readPost", { title: displayTitle })}
                      </span>
                    </Link>

                    <h2
                      title={displayTitle}
                      className="pointer-events-none line-clamp-2 text-2xl font-bold text-slate-100 transition-colors group-hover:text-emerald-400 sm:text-3xl"
                    >
                      {displayTitle}
                    </h2>

                    <p
                      title={fullText}
                      className="pointer-events-none line-clamp-3 text-sm text-slate-400"
                    >
                      {excerpt}
                    </p>

                    <div className="pointer-events-none flex items-center gap-3 font-mono text-xs text-slate-400">
                      <time
                        dateTime={featuredPost.createdAt}
                        className="flex items-center gap-1.5"
                      >
                        <Calendar className="size-3.5" />
                        {format(parseISO(featuredPost.createdAt), "MMMM d, yyyy", {
                          locale: dateLocale,
                        })}
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
              const fullText = getFullText(post, locale);
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
                    {isAdmin && (
                      <div className="mb-4">{renderAdminActions(post)}</div>
                    )}

                    <Link
                      href={`/blog/${post.slug}`}
                      className="absolute inset-0 rounded-3xl"
                    >
                      <span className="sr-only">
                        {tPost("readPost", { title: displayTitle })}
                      </span>
                    </Link>

                    <div className="pointer-events-none mb-2 flex items-center gap-2.5 font-mono text-xs text-slate-400">
                      <time
                        dateTime={post.createdAt}
                        className="flex items-center gap-1"
                      >
                        <Calendar className="size-3.5" />
                        {format(parseISO(post.createdAt), "MMMM d, yyyy", {
                          locale: dateLocale,
                        })}
                      </time>
                      <span className="size-1 rounded-full bg-slate-700" />
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {readingMinutes} min
                      </span>
                    </div>

                    <h2
                      title={displayTitle}
                      className="pointer-events-none line-clamp-2 text-lg font-bold text-slate-100 transition-colors group-hover:text-emerald-400"
                    >
                      {displayTitle}
                    </h2>

                    <p
                      title={fullText}
                      className="pointer-events-none mt-2 line-clamp-3 text-sm text-slate-400"
                    >
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
