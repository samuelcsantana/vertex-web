import Link from "next/link";
import { format, parseISO } from "date-fns";

import { getPosts } from "@/features/blog/api/post-service";

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Technical deep dives on architecture, performance, and engineering.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col gap-2 rounded-lg border border-border p-6 transition-colors hover:bg-muted/50"
          >
            <time
              dateTime={post.date}
              className="text-sm text-muted-foreground"
            >
              {format(parseISO(post.date), "MMMM d, yyyy")}
            </time>
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-sm text-muted-foreground">{post.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
