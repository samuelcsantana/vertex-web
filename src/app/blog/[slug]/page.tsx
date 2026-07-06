import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { getPostBySlug } from "@/features/posts/api/post-service";
import { TopicPills } from "@/features/posts/components/TopicPills";
import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { getProfile } from "@/features/auth/api/profile-service";
import { ShareButton } from "@/components/blog-identity/ShareButton";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // access_token is HttpOnly, so CommentsSection (a client component) can't
  // check auth itself — resolve it here, same pattern as BlogHeader/
  // AdminHeaderActions, and pass down the pieces it needs to render an
  // optimistic comment (the create endpoint doesn't return an author join).
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const profile = accessToken ? await getProfile(accessToken) : null;
  const currentUser = profile
    ? { id: profile.sub, name: profile.name, avatarUrl: profile.avatarUrl }
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Voltar para o Blog
      </Link>

      <h1 className="text-4xl font-bold text-white">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <TopicPills topics={post.topics} />
        <ShareButton title={post.title} />
      </div>

      <div className="prose prose-invert mt-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <CommentsSection
        postId={post.id}
        allowComments={post.allowComments}
        currentUser={currentUser}
      />
    </div>
  );
}
