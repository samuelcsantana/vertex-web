"use client";

import { useTranslations } from "next-intl";
import { FileText, Hash, List, Plus, Settings, Users } from "lucide-react";

import { Link } from "@/i18n/routing";
import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";

const secondaryLinkClasses =
  "inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700";

// The admin shortcut bar on the public home page. Client-resolved for the
// same reason as PostAdminActions: the page is prerendered, so this markup
// must be absent from the HTML every visitor receives, not merely hidden.
export function HomeAdminPanel() {
  const { user } = useCurrentUser();
  const t = useTranslations("Home");

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="relative z-10 mt-10 -mb-8 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950">
          <Settings className="size-4" />
        </div>
        <p className="text-sm font-medium text-white">{t("adminPanelActive")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-200"
        >
          <Plus className="size-3.5" />
          {t("newArticle")}
        </Link>
        <Link href="/dashboard/posts" className={secondaryLinkClasses}>
          <List className="size-3.5" />
          {t("managePosts")}
        </Link>
        <Link href="/dashboard/topics" className={secondaryLinkClasses}>
          <Hash className="size-3.5" />
          {t("topics")}
        </Link>
        <Link href="/dashboard/about" className={secondaryLinkClasses}>
          <FileText className="size-3.5" />
          {t("editAbout")}
        </Link>
        <Link href="/dashboard/users" className={secondaryLinkClasses}>
          <Users className="size-3.5" />
          {t("manageUsers")}
        </Link>
      </div>
    </div>
  );
}
