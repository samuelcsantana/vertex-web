import { notFound } from "next/navigation";

import { getPostBySlug } from "@/features/posts/api/post-service";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">{post.title}</h1>

      {/* Plain text for now; MDX rendering will be wired up in a follow-up. */}
      <p className="mt-8 whitespace-pre-wrap text-foreground">
        {post.content}
      </p>
    </div>
  );
}
