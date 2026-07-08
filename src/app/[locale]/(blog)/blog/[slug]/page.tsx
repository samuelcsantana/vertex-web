import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { Link, getPathname } from "@/i18n/routing";
import { getPostBySlug } from "@/features/posts/api/post-service";
import { TopicPills } from "@/features/posts/components/TopicPills";
import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { getProfile } from "@/features/auth/api/profile-service";
import { ShareButton } from "@/components/blog-identity/ShareButton";
import { createHeadingComponents } from "@/components/blog-identity/markdownHeadingComponents";
import { CodeBlock } from "@/components/blog-identity/CodeBlock";
import { TableOfContents } from "@/components/blog-identity/TableOfContents";
import { stripMarkdown } from "@/features/posts/utils/strip-markdown";
import { extractHeadings } from "@/features/posts/utils/extract-headings";
import {
  getLocalizedContent,
  getLocalizedSlug,
  getLocalizedTitle,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const formatDate = (dateString: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPostBySlug(slug, locale);

  if (!post) {
    return {};
  }

  const title = getLocalizedTitle(post, locale);
  const content = getLocalizedContent(post, locale);
  // A manually-written description wins when set — it's meant to carry
  // the technical keywords a curiosity-driven opening paragraph often
  // doesn't, for SEO. Otherwise fall back to the auto-generated excerpt,
  // same as before this field existed (so existing posts are unaffected).
  const description =
    post.metaDescription || `${stripMarkdown(content).slice(0, 100)}...`;
  // Posts without their own cover fall back to the site icon (rendered onto
  // a proper 1200x630 canvas at public/og-fallback.png) rather than sharing
  // with no image at all.
  const ogImageUrl = post.coverUrl ?? "/og-fallback.png";

  // If this locale has no translation of its own, what's being rendered is
  // the pt fallback content under this locale's URL — point the canonical
  // back at the real pt page instead of self-referencing, so search
  // engines treat this as a duplicate of the pt original rather than a
  // distinct page whose URL and content language disagree.
  const translatedLocales = getTranslatedLocales(post);
  const isTranslated = (translatedLocales as string[]).includes(locale);
  const canonicalLocale = isTranslated ? locale : "pt";
  const canonicalUrl = `${SITE_URL}${getPathname({ href: `/blog/${getLocalizedSlug(post, canonicalLocale)}`, locale: canonicalLocale })}`;

  // Only advertise an hreflang alternate for locales this post genuinely
  // has its own content in — same reasoning sitemap.ts's
  // buildEntriesForRoute uses for the sitemap's own hreflang entries.
  const languageAlternates = Object.fromEntries(
    translatedLocales.map((loc) => [
      loc,
      `${SITE_URL}${getPathname({ href: `/blog/${getLocalizedSlug(post, loc)}`, locale: loc })}`,
    ])
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPostBySlug(slug, locale);

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
    ? {
        id: profile.sub,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
      }
    : null;

  const displayTitle = getLocalizedTitle(post, locale);
  const displayContent = getLocalizedContent(post, locale);
  const headings = extractHeadings(displayContent);
  const hasToc = headings.length > 0;
  const t = await getTranslations("Post");

  // pt is a required field, so the fallback below always lands on the pt
  // version — this is only ever true when locale is "en" or "es" and the
  // post has no translated content of its own for it yet.
  const isTranslated = (getTranslatedLocales(post) as string[]).includes(
    locale
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: displayTitle,
    image: [post.coverUrl ?? `${SITE_URL}/og-fallback.png`],
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: [
      {
        "@type": "Person",
        name: post.author?.name ?? "Samuel Santana",
        url: `${SITE_URL}${getPathname({ href: "/about", locale })}`,
      },
    ],
    mainEntityOfPage: `${SITE_URL}${getPathname({ href: `/blog/${getLocalizedSlug(post, locale)}`, locale })}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:max-w-6xl xl:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* A single mx-auto max-w-3xl lg:mx-0 wrapper owns every left-column
          element (header, prose, comments) so they all share one box and
          can't drift out of alignment with each other — previously each
          had its own independent "mx-auto max-w-3xl", which centered the
          header within the full lg:max-w-6xl outer container while the
          grid's first column left-aligned the prose against it instead,
          leaving the header ~192px out of step with the article text.
          lg:mx-0 always applies (not just when there's a TOC) so an
          article's reading column sits at the same left position
          whether or not that particular post has one — a post's start
          shouldn't visually jump left/right depending on its headings.
          The two-column grid itself still only applies when there's a
          TOC to show — otherwise grid-template-columns would reserve
          the second column's width even with nothing rendered into it,
          leaving a dead 220px+gap gutter on the right. */}
      <div
        className={
          hasToc
            ? "lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8"
            : ""
        }
      >
        <div className="mx-auto max-w-3xl lg:mx-0">
          {/* Links straight to "/" rather than "/blog" — that route only
              exists as a redirect stub for old bookmarks/external links to
              the pre-rename "/blog" index (see blog/page.tsx), so an
              internal link through it just adds a second RSC round-trip
              for no reason. */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            {/* -ml-[3px] compensates for ArrowLeft's own glyph not
                touching the left edge of its viewBox — without it, the
                arrow visually sits ~3px right of the H1/paragraph text
                below it despite both elements' boxes being flush. */}
            <ArrowLeft className="-ml-[3px] size-4" />
            {t("backToBlog")}
          </Link>

          {post.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided URL, not a next/image remote-pattern candidate
            <img
              src={post.coverUrl}
              alt={post.coverAlt ?? ""}
              referrerPolicy="no-referrer"
              className="mb-8 h-64 w-full rounded-2xl object-cover sm:h-80"
            />
          )}

          <h1 className="text-4xl font-bold text-white">{displayTitle}</h1>

          {!isTranslated && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>{t("translationFallbackNotice")}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400 md:gap-4">
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

            <span>{t("publishedOn", { date: formatDate(post.createdAt, locale) })}</span>
            {wasEdited && (
              <span>{t("editedOn", { date: formatDate(post.updatedAt, locale) })}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 md:gap-4">
            <TopicPills topics={post.topics} />
            <ShareButton title={displayTitle} />
          </div>

          <div className="prose prose-invert prose-sm mt-8 max-w-none sm:prose-base lg:prose-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{ ...createHeadingComponents(headings), pre: CodeBlock }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>

          <CommentsSection
            postId={post.id}
            allowComments={post.allowComments}
            currentUser={currentUser}
          />
        </div>

        {hasToc && <TableOfContents headings={headings} />}
      </div>
    </div>
  );
}
