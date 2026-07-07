"use client";

import { useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Ban, ShieldCheck, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import {
  deleteUserAction,
  setUserBannedAction,
} from "@/features/users/actions/user-actions";
import type { ManagedUser } from "@/features/users/types";

interface UserRowProps {
  user: ManagedUser;
  isSelf: boolean;
}

export function UserRow({ user, isSelf }: UserRowProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Dashboard");
  const format = useFormatter();

  async function handleToggleBan() {
    setIsPending(true);
    setError(null);

    const result = await setUserBannedAction(user.id, !user.isBanned);

    setIsPending(false);

    if (!result.success) {
      setError(result.error ?? t("userActionError"));
    }
  }

  async function handleDelete() {
    const result = await deleteUserAction(user.id);

    if (!result.success) {
      setError(result.error ?? t("userActionError"));
    }
  }

  const initial = (user.name?.trim()?.[0] ?? user.email[0] ?? "?").toUpperCase();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- external OAuth provider avatar, not worth a next/image remote-pattern allowlist entry
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="size-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-400">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-slate-100">
                {user.name ?? user.email}
              </span>
              <span
                className={
                  user.role === "admin"
                    ? "rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-400"
                    : "rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400"
                }
              >
                {user.role === "admin" ? t("roleAdmin") : t("roleUser")}
              </span>
              {user.isBanned && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                  {t("userBanned")}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-400">
              {user.email} ·{" "}
              {t("userCreatedOn", {
                date: format.dateTime(new Date(user.createdAt), {
                  dateStyle: "medium",
                }),
              })}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isSelf ? (
            <span className="text-xs text-slate-400">{t("thatsYou")}</span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleBan}
                disabled={isPending}
                className={
                  user.isBanned
                    ? "inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                    : "inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-amber-400 disabled:opacity-50"
                }
              >
                {user.isBanned ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <Ban className="size-3.5" />
                )}
                {user.isBanned ? t("unblockUser") : t("blockUser")}
              </button>
              <ConfirmDialog
                title={t("confirmDeleteUserTitle")}
                description={t("confirmDeleteUserDescription", {
                  name: user.name ?? user.email,
                })}
                confirmLabel={t("removeUser")}
                action={handleDelete}
                trigger={
                  <button
                    type="button"
                    aria-label={t("removeUser")}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                    {t("removeUser")}
                  </button>
                }
              />
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
