"use client";

import { useEffect, useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { MessageCircle, Trash2 } from "lucide-react";

import { Link } from "@/i18n/routing";
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
  // access_token is HttpOnly, so this component cannot read the session
  // itself. It used to receive the resolved profile as a prop, which meant
  // the post page had to call cookies() during its server render — and that
  // one call is what kept every post out of the prerender. The provider
  // resolves the same thing after hydration through /api/me, the path the
  // rest of the app already uses.
  //
  // isAuthenticated is not `user !== null`: it is the cookie's answer,
  // optimistically pre-filled from a local hint at hydration, while `user`
  // only arrives with the profile. Gating the composer on it (and rendering
  // neither branch until isResolved) is what keeps a signed-in visitor from
  // seeing the sign-in card flash before /api/me lands — the same bug this
  // provider was built to fix in the header.
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
      <div className="mt-12 border-t border-slate-800 pt-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 text-center">
          <p className="text-sm text-slate-400">{t("commentsDisabled")}</p>
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

    // The create endpoint returns the raw row with no author join, so the
    // signed-in visitor's own name/avatar stand in for it and the comment
    // appears instantly. Prepended, not appended: the list is newest-first
    // (matching CommentsService.findAllForPost's orderBy on the API side).
    //
    // `user` can be null here even though the write succeeded — the cookie
    // authenticates the Server Action, while the profile behind /api/me is a
    // separate call that can still be in flight or have failed. Without an
    // author to render, refetching is the only way to show the comment that
    // was just written; dropping it silently would look like the submit
    // failed.
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
          isAuthenticated && (
            <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center">
              <p className="text-sm text-slate-400">{t("beFirstToComment")}</p>
            </div>
          )
        ) : (
          comments.map((comment) => {
            const authorName =
              comment.author.displayName ?? comment.author.name;
            const initial = (authorName?.trim()?.[0] ?? "?").toUpperCase();
            // Both read `user`, not `isAuthenticated`: these are controls
            // only some visitors get, so appearing a beat late once the
            // profile lands is right, while guessing and rendering a delete
            // button the API would reject is not.
            const isAdminViewer = user?.role === "admin";
            const canDelete =
              !!user && (user.id === comment.authorId || isAdminViewer);

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
                      {/* Admins get a link into the moderation page and the
                          author's email; the API only includes email in
                          admin-identified responses, never publicly. */}
                      {isAdminViewer ? (
                        <Link
                          href={`/dashboard/users/${comment.author.id}`}
                          className="text-sm font-medium text-slate-100 underline-offset-4 hover:text-emerald-400 hover:underline"
                        >
                          {authorName ?? t("anonymousUser")}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-slate-100">
                          {authorName ?? t("anonymousUser")}
                        </span>
                      )}
                      <span className="ml-2 text-xs text-slate-400">
                        {format.dateTime(new Date(comment.createdAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {isAdminViewer && comment.author.email && (
                        <span className="ml-2 text-xs text-slate-400">
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
        {/* Nothing until hydration decides: this markup is prerendered and
            shipped to every visitor alike, so committing to either branch
            server-side would show one of them the wrong one. */}
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
