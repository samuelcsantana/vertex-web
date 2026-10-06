import { Suspense } from "react";
import { cookies } from "next/headers";

import { redirect } from "@/i18n/routing";
import { applyAdminLocale } from "@/i18n/admin-locale";
import { getProfile } from "@/features/auth/api/profile-service";

async function AdminGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;

  if (profile?.role !== "admin") {
    throw redirect({ href: "/", locale: await applyAdminLocale() });
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
