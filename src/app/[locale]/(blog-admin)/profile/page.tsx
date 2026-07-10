import { cookies } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { Trash2 } from "lucide-react";

import { redirect } from "@/i18n/routing";
import { getProfile } from "@/features/auth/api/profile-service";
import { LinkGithubButton } from "@/features/auth/components/LinkGithubButton";
import { LinkGoogleButton } from "@/features/auth/components/LinkGoogleButton";
import { ConfirmDialog } from "@/components/blog-identity/ConfirmDialog";
import { ProfileForm } from "@/features/users/components/ProfileForm";
import { deleteOwnAccountAction } from "@/features/users/actions/user-actions";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw redirect({ href: "/", locale: await getLocale() });
  }

  const profile = await getProfile(accessToken);

  if (!profile) {
    throw redirect({ href: "/", locale: await getLocale() });
  }

  const t = await getTranslations("Profile");
  const roleLabels: Record<string, string> = {
    admin: t("admin"),
    user: t("user"),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:max-w-6xl xl:px-0">
      <div className="mx-auto max-w-2xl lg:mx-0">
        <h1 className="text-4xl font-bold text-white">{t("heading")}</h1>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                {t("email")}
              </dt>
              <dd className="mt-1 text-sm text-slate-100">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                {t("userType")}
              </dt>
              <dd className="mt-1 text-sm text-slate-100">
                {roleLabels[profile.role] ?? profile.role}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <ProfileForm
              initialName={profile.name ?? ""}
              initialDisplayName={profile.displayName ?? ""}
              initialAvatarUrl={profile.avatarUrl ?? ""}
              email={profile.email}
            />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <h2 className="text-lg font-semibold text-white">{t("linkedAccounts")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("linkedAccountsDescription")}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <LinkGoogleButton googleLinked={Boolean(profile.googleId)} />
            <LinkGithubButton githubLinked={Boolean(profile.githubId)} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">{t("dangerZone")}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t("deleteAccountDescription")}
          </p>

          <div className="mt-4">
            <ConfirmDialog
              title={t("confirmDeleteAccountTitle")}
              description={t("confirmDeleteAccountDescription")}
              confirmLabel={t("deleteAccount")}
              action={async () => {
                "use server";
                await deleteOwnAccountAction();
              }}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="size-4" />
                  {t("deleteAccount")}
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
