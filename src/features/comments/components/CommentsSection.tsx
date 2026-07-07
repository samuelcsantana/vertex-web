"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { LoginModal } from "@/components/blog-identity/LoginModal";
import {
  createCommentAction,
  deleteCommentAction,
  getCommentsAction,
} from "@/features/comments/actions/comment-actions";
import type { Comment } from "@/features/comments/types";
import type { UserRole } from "@/features/auth/api/profile-service";

interface CommentsSectionCurrentUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

interface CommentsSectionProps {
  postId: string;
  allowComments: boolean;
  // access_token is HttpOnly, so a client component can't read it itself —
  // the reading page (a server component) already resolves the session via
  // cookies() + getProfile(), so it passes the result down instead.
  currentUser: CommentsSectionCurrentUser | null;
}

export function CommentsSection({
  postId,
  allowComments,
  currentUser,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const t = useTranslations("Post");
  const format = useFormatter();

  useEffect(() => {
    if (!allowComments) {
      return;
    }

    let cancelled = false;

    getCommentsAction(postId).then((result) => {
      if (!cancelled) {
        setComments(result);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [postId, allowComments]);

  if (!allowComments) {
    return (
      <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-center">
        <p className="text-sm text-slate-400">{t("commentsDisabled")}</p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim() || !currentUser) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createCommentAction(postId, content);

    setIsSubmitting(false);

    if (!result.success || !result.comment) {
      setError(result.error ?? t("genericCommentError"));
      return;
    }

    // The create endpoint returns the raw row with no author join; the
    // logged-in user's own name/avatar (already known client-side) stand
    // in for it so the comment appears instantly, without a refetch.
    // Prepended, not appended: the list is newest-first (matching
    // CommentsService.findAllForPost's orderBy on the API side).
    setComments((previous) => [
      {
        id: result.comment!.id,
        postId,
        authorId: currentUser.id,
        content: result.comment!.content,
        createdAt: result.comment!.createdAt,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatarUrl: currentUser.avatarUrl,
        },
      },
      ...previous,
    ]);
    setContent("");
  }

  async function handleDelete(commentId: string) {
    setDeleteError(null);

    const result = await deleteCommentAction(commentId);

    if (!result.success) {
      setDeleteError(result.error ?? t("genericCommentDeleteError"));
      return;
    }

    setComments((previous) =>
      previous.filter((comment) => comment.id !== commentId)
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-lg font-bold text-white">{t("comments")}</h2>

      <div className="mt-4 flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">{t("loadingComments")}</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500">{t("beFirstToComment")}</p>
        ) : (
          comments.map((comment) => {
            const initial = (comment.author.name?.trim()?.[0] ?? "?").toUpperCase();
            const canDelete =
              !!currentUser &&
              (currentUser.id === comment.authorId ||
                currentUser.role === "admin");

            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
              >
                {comment.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- external OAuth provider avatar, not worth a next/image remote-pattern allowlist entry
                  <img
                    src={comment.author.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-400">
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-slate-100">
                        {comment.author.name ?? t("anonymousUser")}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">
                        {format.dateTime(new Date(comment.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    {canDelete && (
                      <ConfirmDialog
                        title={t("confirmDeleteCommentTitle")}
                        description={t("confirmDeleteCommentDescription")}
                        confirmLabel={t("removeComment")}
                        action={() => handleDelete(comment.id)}
                        trigger={
                          <button
                            type="button"
                            aria-label={t("deleteComment")}
                            className="inline-flex shrink-0 items-center rounded-lg p-1 text-slate-500 transition-colors hover:text-red-400"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        }
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm break-words whitespace-pre-wrap text-slate-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {deleteError && <p className="mt-2 text-sm text-red-400">{deleteError}</p>}

      <div className="mt-6">
        {currentUser ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              placeholder={t("commentPlaceholder")}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.03] disabled:opacity-50 sm:w-fit"
            >
              {isSubmitting ? t("sending") : t("sendComment")}
            </button>
          </form>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03] sm:w-fit"
            >
              {t("loginToComment")}
            </button>
            <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
}
