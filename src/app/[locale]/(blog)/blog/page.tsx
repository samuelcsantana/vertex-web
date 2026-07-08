import { redirect } from "@/i18n/routing";

interface BlogIndexRedirectProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogIndexRedirect({
  params,
}: BlogIndexRedirectProps) {
  const { locale } = await params;
  throw redirect({ href: "/", locale });
}
