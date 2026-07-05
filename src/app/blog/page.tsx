import Link from "next/link";
import { format, parseISO } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPosts } from "@/features/posts/api/post-service";

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Technical deep dives on architecture, performance, and engineering.
      </p>

      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">
          Nenhum artigo publicado ainda.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block h-full">
              <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                <div className="-mx-4 -mt-4 mb-4 h-40 rounded-t-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-neutral-800 dark:to-neutral-900" />
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <time
                    dateTime={post.createdAt}
                    className="text-sm text-muted-foreground"
                  >
                    {format(parseISO(post.createdAt), "MMMM d, yyyy")}
                  </time>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
