import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { getDashboardPosts } from "@/features/posts/api/post-service";
import { TopicPills } from "@/features/posts/components/TopicPills";
import { getTopics } from "@/features/topics/api/topic-service";

export default async function DashboardPostsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const [posts, topics] = await Promise.all([
    getDashboardPosts(accessToken),
    getTopics(),
  ]);
  const t = await getTranslations("Dashboard");
  const tHome = await getTranslations("Home");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-white">{t("managePosts")}</h1>

      <div className="mt-8">
        <CreatePostForm availableTopics={topics} />
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableTitle")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableTopics")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-300">
                {t("tableStatus")}
              </th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  {t("noPostsPublished")}
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-slate-800 bg-slate-900/30 last:border-0"
                >
                  <td className="px-4 py-3 text-slate-100">{post.title}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
