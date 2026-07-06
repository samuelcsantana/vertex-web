import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { EditAboutForm } from "@/features/about/components/EditAboutForm";
import { getAboutContent } from "@/features/about/api/about-service";

export default async function DashboardAboutPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const about = await getAboutContent();
  const t = await getTranslations("Dashboard");
  const tAbout = await getTranslations("About");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        {t("backToPanel")}
      </Link>

      <h1 className="text-4xl font-bold text-white">{tAbout("editHeading")}</h1>
      <p className="mt-2 text-sm text-slate-400">{tAbout("editDescription")}</p>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <EditAboutForm initialContent={about?.content ?? ""} />
      </div>
    </div>
  );
}
