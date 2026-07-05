import { BlogAdminProvider } from "@/components/blog-identity/blog-admin-context";
import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeader } from "@/components/blog-identity/BlogHeader";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";
import { LoginModal } from "@/components/blog-identity/LoginModal";

export default function BlogHomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BlogAdminProvider>
      <div className="relative flex min-h-screen flex-col text-slate-300">
        <BlogBackground />
        <BlogHeader />
        <main className="flex-1">{children}</main>
        <BlogFooter />
        <LoginModal />
      </div>
    </BlogAdminProvider>
  );
}
