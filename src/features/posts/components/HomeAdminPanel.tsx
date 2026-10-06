"use client";

import { useTranslations } from "next-intl";
import { FileText, Hash, List, Plus, Settings, Users } from "lucide-react";

import Link from "next/link";
import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";

const secondaryLinkClasses =
  "inline-flex items-center gap-1.5 rounded-full border border-input bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-input";

export function HomeAdminPanel() {
  const { user } = useCurrentUser();
  const t = useTranslations("Home");

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="relative z-10 mt-10 -mb-8 flex w-full max-w-2xl flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 p-4 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Settings className="size-4" />
        </div>
        <p className="text-sm font-medium text-foreground">{t("adminPanelActive")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/dashboard/posts/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          <Plus className="size-3.5" />
          {t("newArticle")}
        </Link>
        <Link href="/admin/dashboard/posts" className={secondaryLinkClasses}>
          <List className="size-3.5" />
          {t("managePosts")}
        </Link>
        <Link href="/admin/dashboard/topics" className={secondaryLinkClasses}>
          <Hash className="size-3.5" />
          {t("topics")}
        </Link>
        <Link href="/admin/dashboard/about" className={secondaryLinkClasses}>
          <FileText className="size-3.5" />
          {t("editAbout")}
        </Link>
        <Link href="/admin/dashboard/users" className={secondaryLinkClasses}>
          <Users className="size-3.5" />
          {t("manageUsers")}
        </Link>
      </div>
    </div>
  );
}
