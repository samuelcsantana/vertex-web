"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import Link from "next/link";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";

interface PostAdminActionsProps {
  postId: string;
  className?: string;
}

export function PostAdminActions({ postId, className }: PostAdminActionsProps) {
  const { user } = useCurrentUser();
  const t = useTranslations("Home");

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className={className}>
      <div className="relative z-10 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <Link
          href={`/admin/dashboard/posts/${postId}/edit`}
          aria-label={t("editArticle")}
          className="inline-flex items-center gap-1 rounded-lg border border-input bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:text-primary"
        >
          <Pencil className="size-3.5" />
          {t("editArticle")}
        </Link>
        <ConfirmDialog
          title={t("confirmDeleteTitle")}
          description={t("confirmDeleteDescription")}
          confirmLabel={t("confirmContinue")}
          action={deletePostAction.bind(null, postId)}
          trigger={
            <button
              type="button"
              aria-label={t("deleteArticle")}
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
              {t("deleteArticle")}
            </button>
          }
        />
      </div>
    </div>
  );
}
