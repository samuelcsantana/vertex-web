import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deletePostAction } from "@/features/posts/actions/post-actions";
import { CreatePostForm } from "@/features/posts/components/CreatePostForm";
import { getDashboardPosts } from "@/features/posts/api/post-service";

export default async function DashboardPostsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const posts = await getDashboardPosts(accessToken);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">Manage Posts</h1>

      <div className="mt-8">
        <CreatePostForm />
      </div>

      <div className="mt-10 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="w-px px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No posts published yet.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">{post.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={post.isPublished ? "default" : "secondary"}>
                      {post.isPublished ? "Publicado" : "Rascunho"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePostAction.bind(null, post.id)}>
                      <Button type="submit" variant="destructive" size="sm">
                        Excluir
                      </Button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
