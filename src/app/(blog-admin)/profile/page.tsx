import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { getProfile } from "@/features/auth/api/profile-service";
import { LinkGithubButton } from "@/features/auth/components/LinkGithubButton";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const profile = await getProfile(accessToken);

  if (!profile) {
    redirect("/");
  }

  const t = await getTranslations("Profile");
  const roleLabels: Record<string, string> = {
    admin: t("admin"),
    user: t("user"),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-white">{t("heading")}</h1>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profile.name && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                {t("name")}
              </dt>
              <dd className="mt-1 text-sm text-slate-100">{profile.name}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm text-slate-100">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {t("userType")}
            </dt>
            <dd className="mt-1 text-sm text-slate-100">
              {roleLabels[profile.role] ?? profile.role}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <h2 className="text-lg font-semibold text-white">{t("linkedAccounts")}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {t("linkedAccountsDescription")}
        </p>

        <div className="mt-4">
          <LinkGithubButton githubLinked={Boolean(profile.githubId)} />
        </div>
      </div>
    </div>
  );
}
