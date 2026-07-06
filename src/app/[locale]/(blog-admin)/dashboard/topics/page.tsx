import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link, redirect } from "@/i18n/routing";
import { CreateTopicForm } from "@/features/topics/components/CreateTopicForm";
import { TopicRow } from "@/features/topics/components/TopicRow";
import { getTopics } from "@/features/topics/api/topic-service";

export default async function DashboardTopicsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw redirect({ href: "/", locale: await getLocale() });
  }

  const topics = await getTopics();
  const t = await getTranslations("Dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/dashboard/posts"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        {t("backToPanel")}
      </Link>

      <h1 className="text-4xl font-bold text-white">{t("manageTopics")}</h1>
      <p className="mt-2 text-sm text-slate-400">{t("topicsDescription")}</p>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <CreateTopicForm />
      </div>

      <div className="mt-8 flex flex-col gap-2">
        {topics.length === 0 ? (
          <p className="text-slate-500">{t("noTopicsYet")}</p>
        ) : (
          topics.map((topic) => <TopicRow key={topic.id} topic={topic} />)
        )}
      </div>
    </div>
  );
}
