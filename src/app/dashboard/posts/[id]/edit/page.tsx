import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { EditPostForm } from "@/features/posts/components/EditPostForm";
import { getDashboardPosts } from "@/features/posts/api/post-service";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const posts = await getDashboardPosts(accessToken);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Editar Artigo</h1>

      <div className="mt-8">
        <EditPostForm initialData={post} />
      </div>
    </div>
  );
}
