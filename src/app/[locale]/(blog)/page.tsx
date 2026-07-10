import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { FileText, Hash, List, Pencil, Plus, Settings, Trash2, Users } from "lucide-react";

import { Link, routing } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { getPosts } from "@/features/posts/api/post-service";
import { TopicPills } from "@/features/posts/components/TopicPills";
import {
  getLocalizedCoverAlt,
  getLocalizedCoverUrl,
  getLocalizedTitle,
} from "@/features/posts/utils/localized-content";
import { getProfile } from "@/features/auth/api/profile-service";

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

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
        {posts.length === 0 ? (
          <p className="col-span-full text-slate-400">{t("noPostsYet")}</p>
        ) : (
          posts.map((post) => {
            const displayTitle = getLocalizedTitle(post, locale);
            const displayCoverUrl = getLocalizedCoverUrl(post, locale);
            const displayCoverAlt = getLocalizedCoverAlt(post, locale);

            return (
              <div
                key={post.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                {displayCoverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, not a next/image remote-pattern candidate
                  <img
                    src={displayCoverUrl}
                    alt={displayCoverAlt ?? ""}
                    referrerPolicy="no-referrer"
                    className="pointer-events-none aspect-video w-full object-cover"
                  />
                )}

                <div className="p-6">
                  {isAdmin && (
                    <div className="relative z-10 mb-4 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
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
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="absolute inset-0 rounded-3xl"
                  >
                    <span className="sr-only">
                      {tPost("readPost", { title: displayTitle })}
                    </span>
                  </Link>

                  <h2 className="pointer-events-none text-lg font-bold text-slate-100 transition-colors group-hover:text-emerald-400">
                    {displayTitle}
                  </h2>

                  <time
                    dateTime={post.createdAt}
                    className="pointer-events-none mt-2 block text-sm text-slate-400"
                  >
                    {format(parseISO(post.createdAt), "MMMM d, yyyy", {
                      locale: dateLocale,
                    })}
                  </time>

                  <TopicPills
                    topics={post.topics}
                    limit={2}
                    className="pointer-events-none mt-3"
                  />
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
