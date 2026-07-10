"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { Link, useRouter } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { deleteCommentAction } from "@/features/comments/actions/comment-actions";
import type { ModeratedComment } from "@/features/users/types";

interface ModeratedCommentRowProps {
  comment: ModeratedComment;
}

export function ModeratedCommentRow({ comment }: ModeratedCommentRowProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Dashboard");
  const tPost = useTranslations("Post");
  const format = useFormatter();

  async function handleDelete() {
    setError(null);

    const result = await deleteCommentAction(comment.id);

    if (!result.success) {
      setError(result.error ?? t("userActionError"));
      return;
    }

    // Server-rendered list (unlike the post page's client state) — refetch.
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/blog/${comment.post.slug}`}
            className="text-sm font-medium text-emerald-400 underline-offset-4 hover:underline"
          >
            {comment.post.title}
          </Link>
          <span className="ml-2 text-xs text-slate-400">
            {format.dateTime(new Date(comment.createdAt), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>

        <ConfirmDialog
          title={tPost("confirmDeleteCommentTitle")}
          description={tPost("confirmDeleteCommentDescription")}
          confirmLabel={tPost("removeComment")}
          action={handleDelete}
          trigger={
            <button
              type="button"
              aria-label={tPost("deleteComment")}
              className="inline-flex shrink-0 items-center rounded-lg p-1 text-slate-400 transition-colors hover:text-red-400"
            >
              <Trash2 className="size-4" />
            </button>
          }
        />
      </div>

      <p className="mt-1 text-sm break-words whitespace-pre-wrap text-slate-300">
        {comment.content}
      </p>

      {error && (
        <p role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
