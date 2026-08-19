"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";

import { Link } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";

interface PostAdminActionsProps {
  postId: string;
  // Positioning is the caller's business — the featured card needs these
  // absolutely positioned so they add no height, the grid cards don't.
  className?: string;
}

// Renders nothing at all for non-admins, rather than rendering hidden markup.
// That matters now that the home page is prerendered: whatever this returns
// ends up in HTML served to every visitor, so the edit/delete controls have
// to be absent, not just invisible.
//
// This is presentation only. Authorisation still happens server-side —
// deletePostAction re-reads the cookie and vertex-api enforces the role — so
// resolving `isAdmin` on the client cannot grant anything.
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
          href={`/dashboard/posts/${postId}/edit`}
          aria-label={t("editArticle")}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:text-emerald-400"
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
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
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
