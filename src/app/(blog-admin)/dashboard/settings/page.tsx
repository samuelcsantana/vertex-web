import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getProfile } from "@/features/auth/api/profile-service";
import { LinkGithubButton } from "@/features/auth/components/LinkGithubButton";

export default async function DashboardSettingsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/");
  }

  const profile = await getProfile(accessToken);

  if (!profile) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-white">Definições</h1>
      <p className="mt-2 text-sm text-slate-400">{profile.email}</p>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <h2 className="text-lg font-semibold text-white">Contas Vinculadas</h2>
        <p className="mt-1 text-sm text-slate-400">
          Conecte contas externas para entrar mais rápido.
        </p>

        <div className="mt-4">
          <LinkGithubButton githubLinked={Boolean(profile.githubId)} />
        </div>
      </div>
    </div>
  );
}
