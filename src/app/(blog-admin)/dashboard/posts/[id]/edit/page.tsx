import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { EditPostForm } from "@/features/posts/components/EditPostForm";
import { getDashboardPosts } from "@/features/posts/api/post-service";
import { getTopics } from "@/features/topics/api/topic-service";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const [posts, topics] = await Promise.all([
    getDashboardPosts(accessToken),
    getTopics(),
  ]);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/dashboard/posts"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Voltar para o Painel
      </Link>

      <h1 className="text-4xl font-bold text-white">Editar Artigo</h1>

      <div className="mt-8">
        <EditPostForm initialData={post} availableTopics={topics} />
      </div>
    </div>
  );
}
