import { cookies } from "next/headers";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { redirect } from "@/i18n/routing";
import { applyAdminLocale } from "@/i18n/admin-locale";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { getTopics } from "@/features/topics/api/topic-service";

export default async function NewPostPage() {
  const locale = await applyAdminLocale();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw redirect({ href: "/", locale });
  }

  const topics = await getTopics();
  const t = await getTranslations("Dashboard");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:max-w-6xl xl:px-0">
      <div className="mx-auto max-w-3xl lg:mx-0">
        <NextLink
          href="/admin/dashboard/posts"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          {t("backToPanel")}
        </NextLink>

        <h1 className="text-4xl font-bold text-white">{t("newArticleHeading")}</h1>

        <div className="mt-8">
          <CreatePostForm availableTopics={topics} />
        </div>
      </div>
    </div>
  );
}
