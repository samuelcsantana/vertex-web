"use client";

import { useEffect, useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { MessageCircle, Trash2 } from "lucide-react";

import Link from "next/link";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { LoginModal } from "@/components/blog-identity/LoginModal";
import {
  createCommentAction,
  deleteCommentAction,
  getCommentsAction,
} from "@/features/comments/actions/comment-actions";
import type { Comment } from "@/features/comments/types";
import { useCurrentUser } from "@/features/auth/components/CurrentUserProvider";

interface CommentsSectionProps {
  postId: string;
  allowComments: boolean;
}

export function CommentsSection({
  postId,
  allowComments,
}: CommentsSectionProps) {
  const { user, isAuthenticated, isResolved } = useCurrentUser();
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
      <div className="mt-12 border-t border-border pt-10">
        <div className="rounded-2xl border border-border bg-card/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("commentsDisabled")}</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content.trim()) {
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

    setContent("");

    if (!user) {
      setComments(await getCommentsAction(postId));
      return;
    }

    setComments((previous) => [
      {
        id: result.comment!.id,
        postId,
        authorId: user.id,
        content: result.comment!.content,
        createdAt: result.comment!.createdAt,
        author: {
          id: user.id,
          name: user.name,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
      },
      ...previous,
    ]);
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
    <div className="mt-12 border-t border-border pt-10">
      <h2 className="text-lg font-bold text-foreground">
        {t("comments")}
        {!isLoading && comments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loadingComments")}</p>
        ) : comments.length === 0 ? (
          isAuthenticated && (
            <div className="rounded-2xl border border-dashed border-input p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("beFirstToComment")}</p>
            </div>
          )
        ) : (
          comments.map((comment) => {
            const authorName =
              comment.author.displayName ?? comment.author.name;
            const initial = (authorName?.trim()?.[0] ?? "?").toUpperCase();
            const isAdminViewer = user?.role === "admin";
            const canDelete =
              !!user && (user.id === comment.authorId || isAdminViewer);

            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-2xl border border-border bg-card/30 p-4"
              >
                {comment.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.author.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {isAdminViewer ? (
                        <Link
                          href={`/admin/dashboard/users/${comment.author.id}`}
                          className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          {authorName ?? t("anonymousUser")}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {authorName ?? t("anonymousUser")}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {format.dateTime(new Date(comment.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {isAdminViewer && comment.author.email && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          · {comment.author.email}
                        </span>
                      )}
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
                            className="inline-flex shrink-0 items-center rounded-lg p-1 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        }
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm break-words whitespace-pre-wrap text-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {deleteError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {deleteError}
        </p>
      )}

      <div className="mt-6">
        {!isResolved ? null : isAuthenticated ? (
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
              className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/70 focus:outline-none"
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] disabled:opacity-50 sm:w-fit"
            >
              {isSubmitting ? t("sending") : t("sendComment")}
            </button>
          </form>
        ) : (
          <>
            <div className="rounded-2xl border border-border bg-card/30 px-6 py-8 text-center">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle aria-hidden className="size-5 text-primary" />
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {t("joinConversationTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("joinConversationDescription")}
              </p>
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
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
