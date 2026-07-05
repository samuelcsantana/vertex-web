import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeaderShell } from "@/components/blog-identity/BlogHeaderShell";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { AdminHeaderActions } from "@/components/blog-identity/AdminHeaderActions";

export default function BlogAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col text-slate-300">
      <BlogBackground />
      <BlogHeaderShell rightSlot={<AdminHeaderActions />} />
      <main className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
