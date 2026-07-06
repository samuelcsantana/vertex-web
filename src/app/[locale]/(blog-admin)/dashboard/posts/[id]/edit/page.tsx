import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link, redirect } from "@/i18n/routing";
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
    const locale = await getLocale();
    throw redirect({ href: "/", locale });
  }

  const [posts, topics] = await Promise.all([
    getDashboardPosts(accessToken),
    getTopics(),
  ]);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("Dashboard");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/dashboard/posts"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        {t("backToPanel")}
      </Link>

      <h1 className="text-4xl font-bold text-white">{t("editArticleHeading")}</h1>

      <div className="mt-8">
        <EditPostForm initialData={post} availableTopics={topics} />
      </div>
    </div>
  );
}
