import Link from "next/link";

import { getPosts } from "@/features/posts/api/post-service";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Technical deep dives on architecture, performance, and engineering.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Nenhum artigo publicado ainda.
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-lg border border-border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
            >
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-semibold">{post.title}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
