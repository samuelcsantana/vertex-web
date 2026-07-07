import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/routing";
import { UserRow } from "@/features/users/components/UserRow";
import { getUsers } from "@/features/users/api/user-service";
import { getProfile } from "@/features/auth/api/profile-service";

export default async function DashboardUsersPage() {
  // dashboard/layout.tsx already guarantees an admin session got this far,
  // so the token is present — it's only re-read here to fetch the list and
  // to know the current admin's own id (to hide self-ban/self-delete
  // controls, matching what the backend already refuses).
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")!.value;
  const [users, profile] = await Promise.all([
    getUsers(accessToken),
    getProfile(accessToken),
  ]);
  const t = await getTranslations("Dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link
        href="/dashboard/posts"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        {t("backToPanel")}
      </Link>

      <h1 className="text-4xl font-bold text-white">{t("manageUsersTitle")}</h1>
      <p className="mt-2 text-sm text-slate-400">{t("usersDescription")}</p>

      <div className="mt-8 flex flex-col gap-2">
        {users.length === 0 ? (
          <p className="text-slate-400">{t("noUsersYet")}</p>
        ) : (
          users.map((user) => (
            <UserRow key={user.id} user={user} isSelf={user.id === profile?.sub} />
          ))
        )}
      </div>
    </div>
  );
}
