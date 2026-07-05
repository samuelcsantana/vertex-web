import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions/auth-actions";
import { getProfile } from "@/features/auth/api/profile-service";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const profile = await getProfile(accessToken);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Welcome, {profile.email}</CardTitle>
          <CardDescription>
            This page is only reachable with a valid session cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="w-fit">
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Blog & Artigos</CardTitle>
            <CardDescription>Escreva e publique novos artigos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/posts" />}
            >
              Gerenciar posts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfólio & Projetos</CardTitle>
            <CardDescription>
              Cadastre novos cases de arquitetura.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/projects" />}
            >
              Gerenciar projetos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
