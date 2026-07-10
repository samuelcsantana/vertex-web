"use client";

import { useEffect, useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { MessageCircle, Trash2 } from "lucide-react";

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
  displayName: string | null;
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
  const commentFieldId = useId();

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
      <div className="mt-12 border-t border-slate-800 pt-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-center">
          <p className="text-sm text-slate-400">{t("commentsDisabled")}</p>
        </div>
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
          displayName: currentUser.displayName,
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
    <div className="mt-12 border-t border-slate-800 pt-10">
      <h2 className="text-lg font-bold text-white">
        {t("comments")}
        {!isLoading && comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({comments.length})
          </span>
        )}
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-400">{t("loadingComments")}</p>
        ) : comments.length === 0 ? (
          // Logged out with no comments renders only the sign-in card
          // below — an empty-state card stacked on top of it would just
          // be two near-identical panels saying the same thing.
          currentUser && (
            <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center">
              <p className="text-sm text-slate-400">{t("beFirstToComment")}</p>
            </div>
          )
        ) : (
          comments.map((comment) => {
            const authorName =
              comment.author.displayName ?? comment.author.name;
            const initial = (authorName?.trim()?.[0] ?? "?").toUpperCase();
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
                        {authorName ?? t("anonymousUser")}
                      </span>
                      <span className="ml-2 text-xs text-slate-400">
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
                            className="inline-flex shrink-0 items-center rounded-lg p-1 text-slate-400 transition-colors hover:text-red-400"
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

      {deleteError && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {deleteError}
        </p>
      )}

      <div className="mt-6">
        {currentUser ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label htmlFor={commentFieldId} className="sr-only">
              {t("commentPlaceholder")}
            </label>
            <textarea
              id={commentFieldId}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={3}
              placeholder={t("commentPlaceholder")}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/70 focus:outline-none"
            />
            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}
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
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 px-6 py-8 text-center">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <MessageCircle aria-hidden className="size-5 text-emerald-400" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-100">
                {t("joinConversationTitle")}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {t("joinConversationDescription")}
              </p>
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_-2px_rgba(16,185,129,0.7)] transition-transform hover:scale-[1.03]"
              >
                {t("loginToComment")}
              </button>
            </div>
            <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
}
