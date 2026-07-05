import { cookies } from "next/headers";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions/auth-actions";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value ?? "";
  const tokenPreview = `${accessToken.slice(0, 10)}...`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Restricted area</CardTitle>
          <CardDescription>
            This page is only reachable with a valid session cookie.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Access token read by the Server Component:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
              {tokenPreview}
            </code>
          </p>

          <form action={logoutAction}>
            <Button type="submit" variant="outline" className="w-fit">
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
