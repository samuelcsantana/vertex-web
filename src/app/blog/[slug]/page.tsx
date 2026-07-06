import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
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
import { stripMarkdown } from "@/features/posts/utils/strip-markdown";
import {
  getLocalizedContent,
  getLocalizedTitle,
} from "@/features/posts/utils/localized-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const formatDate = (dateString: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const locale = await getLocale();
  const title = getLocalizedTitle(post, locale);
  const content = getLocalizedContent(post, locale);
  const description = `${stripMarkdown(content).slice(0, 100)}...`;
  const images = post.coverUrl ? [{ url: post.coverUrl }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverUrl ? [post.coverUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // GET /posts/:slug didn't used to join the author at all (posts.authorId
  // was the only thing on the row) — vertex-api's postsRelations/
  // postWithTopicsQuery now eager-load it (author: { id, name, avatarUrl }),
  // but keep this guard rather than crash the page if that regresses.
  if (!post.author) {
    console.warn(
      `Post "${post.slug}" has no author join — check vertex-api's posts.service.ts postWithTopicsQuery (with: { author: ... }) and the posts<->users relation in schema.ts.`
    );
  }

  const wasEdited =
    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() >
      60_000 ||
    new Date(post.createdAt).toDateString() !==
      new Date(post.updatedAt).toDateString();

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

  const locale = await getLocale();
  const displayTitle = getLocalizedTitle(post, locale);
  const displayContent = getLocalizedContent(post, locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Voltar para o Blog
      </Link>

      {post.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, not a next/image remote-pattern candidate
        <img
          src={post.coverUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-80"
        />
      )}

      <h1 className="text-4xl font-bold text-white">{displayTitle}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
        {post.author && (
          <div className="flex items-center gap-2">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external OAuth provider avatar, not worth a next/image remote-pattern allowlist entry
              <img
                src={post.author.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="size-7 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-400">
                {(post.author.name?.trim()?.[0] ?? "?").toUpperCase()}
              </span>
            )}
            <span className="font-medium text-slate-300">{post.author.name}</span>
          </div>
        )}

        <span>Publicado em {formatDate(post.createdAt)}</span>
        {wasEdited && <span>(Editado em {formatDate(post.updatedAt)})</span>}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <TopicPills topics={post.topics} />
        <ShareButton title={displayTitle} />
      </div>

      <div className="prose prose-invert mt-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {displayContent}
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
