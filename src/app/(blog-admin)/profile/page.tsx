import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getProfile } from "@/features/auth/api/profile-service";
import { LinkGithubButton } from "@/features/auth/components/LinkGithubButton";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  user: "Usuário",
};

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-white">Perfil</h1>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profile.name && (
            <div>
              <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Nome
              </dt>
              <dd className="mt-1 text-sm text-slate-100">{profile.name}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Email
            </dt>
            <dd className="mt-1 text-sm text-slate-100">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Tipo de usuário
            </dt>
            <dd className="mt-1 text-sm text-slate-100">
              {ROLE_LABELS[profile.role] ?? profile.role}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
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
