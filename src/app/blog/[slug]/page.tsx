import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getPostBySlug } from "@/features/blog/api/post-service";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">{post.title}</h1>
      <time
        dateTime={post.date}
        className="mt-2 block text-sm text-muted-foreground"
      >
        {format(parseISO(post.date), "MMMM d, yyyy")}
      </time>

      <article className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <MDXRemote source={post.content} />
      </article>
    </div>
  );
}
