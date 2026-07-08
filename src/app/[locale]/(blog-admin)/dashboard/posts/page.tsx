import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { Link, redirect } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { getDashboardPosts } from "@/features/posts/api/post-service";
import { TopicPills } from "@/features/posts/components/TopicPills";
import { getTranslatedLocales } from "@/features/posts/utils/localized-content";

const badgeClasses =
  "rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase";
const badgeActive = `${badgeClasses} bg-emerald-500/10 text-emerald-400`;
const badgeInactive = `${badgeClasses} bg-slate-800 text-slate-400`;

export default async function DashboardPostsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw redirect({ href: "/", locale: await getLocale() });
  }

  const posts = await getDashboardPosts(accessToken);
  const locale = await getLocale();
  const dateLocale = locale === "en" ? enUS : ptBR;
  const t = await getTranslations("Dashboard");
  const tHome = await getTranslations("Home");

  return (
    // Outer box matches the header's own effective width (see
    // BlogHeaderShell.tsx) so this page's content shares its left edge
    // with the header logo above it, same pattern as blog/[slug]/page.tsx
    // and (blog)/about/page.tsx.
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:max-w-6xl xl:px-0">
      <div className="mx-auto max-w-3xl lg:mx-0">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold text-white">{t("managePosts")}</h1>
          <Link
            href="/dashboard/posts/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03]"
          >
            <Plus className="size-4" />
            {t("newArticleHeading")}
          </Link>
        </div>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableTitle")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableLanguage")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableTopics")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableStatus")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableComments")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableSeo")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300 whitespace-nowrap">
                {t("tableCreatedAt")}
              </th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  {t("noPostsPublished")}
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const translatedLocales = getTranslatedLocales(post);

                return (
                  <tr
                    key={post.id}
                    className="border-b border-slate-800 bg-slate-900/30 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-100">{post.title}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(["pt", "en", "es"] as const).map((language) => (
                          <span
                            key={language}
                            className={
                              translatedLocales.includes(language)
                                ? badgeActive
                                : badgeInactive
                            }
                          >
                            {language.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <TopicPills topics={post.topics} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          post.isPublished
                            ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                            : "rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400"
                        }
                      >
                        {post.isPublished ? t("published") : t("draft")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          post.allowComments ? badgeActive : badgeInactive
                        }
                      >
                        {post.allowComments
                          ? t("commentsEnabled")
                          : t("commentsDisabled")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          post.metaDescription ? badgeActive : badgeInactive
                        }
                      >
                        {post.metaDescription ? t("seoCustom") : t("seoAuto")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {format(parseISO(post.createdAt), "d MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400"
                        >
                          <Pencil className="size-3.5" />
                          {t("edit")}
                        </Link>
                        <ConfirmDialog
                          title={tHome("confirmDeleteTitle")}
                          description={tHome("confirmDeleteDescription")}
                          confirmLabel={tHome("confirmContinue")}
                          action={deletePostAction.bind(null, post.id)}
                          trigger={
                            <button
                              type="button"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                            >
                              <Trash2 className="size-3.5" />
                              {t("delete")}
                            </button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
