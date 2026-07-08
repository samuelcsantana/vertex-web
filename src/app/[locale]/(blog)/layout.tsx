import { BlogBackground } from "@/components/blog-identity/BlogBackground";
import { BlogHeader } from "@/components/blog-identity/BlogHeader";
import { BlogFooter } from "@/components/blog-identity/BlogFooter";

export default function BlogHomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col text-slate-300">
      <BlogBackground />
      <BlogHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
}
