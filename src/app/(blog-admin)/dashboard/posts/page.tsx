import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { getDashboardPosts } from "@/features/posts/api/post-service";

export default async function DashboardPostsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const posts = await getDashboardPosts(accessToken);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-white">Gerenciar Posts</h1>

      <div className="mt-8">
        <CreatePostForm />
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-300">Título</th>
              <th className="px-4 py-3 font-medium text-slate-300">Status</th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  Nenhum post publicado ainda.
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
                    <span
                      className={
                        post.isPublished
                          ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400"
                          : "rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400"
                      }
                    >
                      {post.isPublished ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400"
                      >
                        <Pencil className="size-3.5" />
                        Editar
                      </Link>
                      <ConfirmDialog
                        title="Tem certeza absoluta?"
                        description="Esta ação não pode ser desfeita e removerá os dados permanentemente."
                        confirmLabel="Continuar"
                        action={deletePostAction.bind(null, post.id)}
                        trigger={
                          <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            <Trash2 className="size-3.5" />
                            Excluir
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
