import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { CreateTopicForm } from "@/features/topics/components/CreateTopicForm";
import { deleteTopicAction } from "@/features/topics/actions/topic-actions";
import { getTopics } from "@/features/topics/api/topic-service";

export default async function DashboardTopicsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const topics = await getTopics();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/dashboard/posts"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Voltar para o Painel
      </Link>

      <h1 className="text-4xl font-bold text-white">Tópicos</h1>
      <p className="mt-2 text-sm text-slate-400">
        Gerencie os tópicos disponíveis para os artigos.
      </p>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <CreateTopicForm />
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {topics.length === 0 ? (
          <p className="text-slate-500">Nenhum tópico cadastrado ainda.</p>
        ) : (
          topics.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3"
            >
              <span className="text-sm text-slate-100">{topic.name}</span>
              <ConfirmDialog
                title="Remover tópico?"
                description={`"${topic.name}" será removido de todos os artigos vinculados a ele.`}
                confirmLabel="Remover"
                action={deleteTopicAction.bind(null, topic.id)}
                trigger={
                  <button
                    type="button"
                    aria-label="Remover tópico"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                    Remover
                  </button>
                }
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
