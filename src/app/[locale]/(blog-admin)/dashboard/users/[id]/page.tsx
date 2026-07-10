import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Link } from "@/i18n/routing";
import { getUser, getUserComments } from "@/features/users/api/user-service";
import { getProfile } from "@/features/auth/api/profile-service";
import { UserModerationActions } from "@/features/users/components/UserModerationActions";
import { ModeratedCommentRow } from "@/features/users/components/ModeratedCommentRow";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  // dashboard/layout.tsx already guarantees an admin session got this far
  // (same note as the users listing).
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")!.value;

  const [user, comments, profile] = await Promise.all([
    getUser(id, accessToken),
    getUserComments(id, accessToken),
    getProfile(accessToken),
  ]);

  if (!user) {
    notFound();
  }

  const t = await getTranslations("Dashboard");
  const tProfile = await getTranslations("Profile");
  const format = await getFormatter();

  const shownName = user.displayName ?? user.name ?? user.email;
  const initial = (shownName.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:max-w-6xl xl:px-0">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <Link
          href="/dashboard/users"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          {t("backToUsers")}
        </Link>

        <div className="flex flex-wrap items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- bucket/OAuth-provider avatar URL, not a next/image remote-pattern candidate
            <img
              src={user.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="size-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-semibold text-emerald-400">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-3xl font-bold text-white">
              <span className="truncate">{shownName}</span>
              <span
                className={
                  user.role === "admin"
                    ? "rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400"
                    : "rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400"
                }
              >
                {user.role === "admin" ? t("roleAdmin") : t("roleUser")}
              </span>
              {user.isBanned && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                  {t("userBanned")}
                </span>
              )}
            </h1>
            <p className="mt-1 truncate text-sm text-slate-400">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {user.name && (
              <div>
                <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  {tProfile("name")}
                </dt>
                <dd className="mt-1 text-sm text-slate-100">{user.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                {t("memberSince")}
              </dt>
              <dd className="mt-1 text-sm text-slate-100">
                {format.dateTime(new Date(user.createdAt), {
                  dateStyle: "medium",
                })}
              </dd>
            </div>
            {(user.githubId || user.googleId) && (
              <div>
                <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                  {tProfile("linkedAccounts")}
                </dt>
                <dd className="mt-1 flex flex-wrap gap-3 text-sm text-slate-100">
                  {user.googleId && (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      Google
                    </span>
                  )}
                  {user.githubId && (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      GitHub
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <UserModerationActions
              userId={user.id}
              isBanned={user.isBanned}
              isSelf={user.id === profile?.sub}
              userName={shownName}
            />
          </div>
        </div>

        <h2 className="mt-10 text-lg font-bold text-white">
          {t("userComments")}
          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({comments.length})
            </span>
          )}
        </h2>

        <div className="mt-4 flex flex-col gap-2">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400">{t("noCommentsYet")}</p>
          ) : (
            comments.map((comment) => (
              <ModeratedCommentRow key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
