import { BlogAdminProvider } from "./_components/blog-admin-context";
import { BlogBackground } from "./_components/BlogBackground";
import { BlogHeader } from "./_components/BlogHeader";
import { BlogFooter } from "./_components/BlogFooter";
import { LoginModal } from "./_components/LoginModal";

export default function BlogLayout({
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
