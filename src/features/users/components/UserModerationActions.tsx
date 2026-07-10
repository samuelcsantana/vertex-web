"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, ShieldCheck, Trash2 } from "lucide-react";

import { useRouter } from "@/i18n/routing";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import {
  deleteUserAction,
  setUserBannedAction,
} from "@/features/users/actions/user-actions";

interface UserModerationActionsProps {
  userId: string;
  isBanned: boolean;
  isSelf: boolean;
  userName: string;
}

// The user-detail page's version of UserRow's moderation controls — same
// actions, but ban refreshes this page and a deleted account navigates
// back to the listing (this page no longer exists afterwards).
export function UserModerationActions({
  userId,
  isBanned,
  isSelf,
  userName,
}: UserModerationActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("Dashboard");

  if (isSelf) {
    return <p className="text-sm text-slate-400">{t("thatsYou")}</p>;
  }

  async function handleToggleBan() {
    setIsPending(true);
    setError(null);

    const result = await setUserBannedAction(userId, !isBanned);

    setIsPending(false);

    if (!result.success) {
      setError(result.error ?? t("userActionError"));
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    setError(null);

    const result = await deleteUserAction(userId);

    if (!result.success) {
      setError(result.error ?? t("userActionError"));
      return;
    }

    router.push("/dashboard/users");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleToggleBan}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {isBanned ? (
            <ShieldCheck className="size-4" />
          ) : (
            <Ban className="size-4" />
          )}
          {isBanned ? t("unblockUser") : t("blockUser")}
        </button>

        <ConfirmDialog
          title={t("confirmDeleteUserTitle")}
          description={t("confirmDeleteUserDescription", { name: userName })}
          confirmLabel={t("removeUser")}
          action={handleDelete}
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="size-4" />
              {t("removeUser")}
            </button>
          }
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
