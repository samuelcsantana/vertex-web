import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Info, Languages } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { Link, getPathname } from "@/i18n/routing";
import {
  getPostBySlugCrossLocale,
  getPosts,
} from "@/features/posts/api/post-service";
import { CoverImage } from "@/features/posts/components/CoverImage";
import { TopicPills } from "@/features/posts/components/TopicPills";
import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { ShareButton } from "@/components/blog-identity/ShareButton";
import { createHeadingComponents } from "@/components/blog-identity/markdownHeadingComponents";
import { CodeBlock } from "@/components/blog-identity/CodeBlock";
import { TableOfContents } from "@/components/blog-identity/TableOfContents";
import { stripMarkdown } from "@/features/posts/utils/strip-markdown";
import { extractHeadings } from "@/features/posts/utils/extract-headings";
import { formatPostDate } from "@/features/posts/utils/format-post-date";
import {
  getLocalizedContent,
  getLocalizedCoverAlt,
  getLocalizedCoverUrl,
  getLocalizedMetaDescription,
  getLocalizedSlug,
  getLocalizedTitle,
  getTranslatedLocales,
} from "@/features/posts/utils/localized-content";
import { SITE_URL } from "@/lib/site-url";
import { SOCIAL_PROFILE_URLS } from "@/lib/social-profiles";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const posts = await getPosts();

  return posts.map((post) => ({
    slug: getLocalizedSlug(post, params.locale),
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const resolved = await getPostBySlugCrossLocale(slug, locale);

  if (!resolved) {
    return {};
  }

  const { post, contentLocale } = resolved;

  const title = getLocalizedTitle(post, contentLocale);
  const content = getLocalizedContent(post, contentLocale);
  const description =
    getLocalizedMetaDescription(post, contentLocale) ||
    `${stripMarkdown(content).slice(0, 100)}...`;
  const ogImageUrl =
    getLocalizedCoverUrl(post, contentLocale) ?? `${SITE_URL}/og-fallback.png`;

  const translatedLocales = getTranslatedLocales(post);
  const isTranslated = (translatedLocales as string[]).includes(locale);
  const canonicalLocale =
    contentLocale !== locale ? contentLocale : isTranslated ? locale : "pt";
  const canonicalUrl = `${SITE_URL}${getPathname({ href: `/blog/${getLocalizedSlug(post, canonicalLocale)}`, locale: canonicalLocale })}`;

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
      publishedTime: post.publishedAt ?? post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author?.name ?? "Samuel Santana"],
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
  const resolved = await getPostBySlugCrossLocale(slug, locale);

  if (!resolved) {
    notFound();
  }

  const { post, contentLocale } = resolved;

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

  const displayTitle = getLocalizedTitle(post, contentLocale);
  const displayContent = getLocalizedContent(post, contentLocale);
  const displayCoverUrl = getLocalizedCoverUrl(post, contentLocale);
  const displayCoverAlt = getLocalizedCoverAlt(post, contentLocale);
  const headings = extractHeadings(displayContent);
  const hasToc = headings.length > 0;
  const t = await getTranslations("Post");

  const isTranslated = (getTranslatedLocales(post) as string[]).includes(
    locale
  );

  const isCrossLanguage = contentLocale !== locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: displayTitle,
    image: [displayCoverUrl ?? `${SITE_URL}/og-fallback.png`],
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: [
      {
        "@type": "Person",
        name: post.author?.name ?? "Samuel Santana",
        url: `${SITE_URL}${getPathname({ href: "/about", locale })}`,
        sameAs: SOCIAL_PROFILE_URLS,
      },
    ],
    mainEntityOfPage: `${SITE_URL}${getPathname({ href: `/blog/${getLocalizedSlug(post, contentLocale)}`, locale: contentLocale })}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 lg:max-w-6xl xl:px-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        className={
          hasToc
            ? "lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8"
            : ""
        }
      >
        <div className="mx-auto max-w-3xl lg:mx-0">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="-ml-[3px] size-4" />
            {t("backToBlog")}
          </Link>

          {displayCoverUrl && (
            <CoverImage
              src={displayCoverUrl}
              alt={displayCoverAlt ?? ""}
              sizes="(min-width: 768px) 768px, 100vw"
              priority
              className="mb-8 aspect-[1200/630] h-auto w-full rounded-2xl object-cover"
            />
          )}

          <h1 className="text-4xl font-bold text-foreground">{displayTitle}</h1>

          {isCrossLanguage ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              <Languages className="mt-0.5 size-4 shrink-0" />
              <p>
                {t("crossLanguageNotice", { language: contentLocale })}
                {isTranslated && (
                  <>
                    {" "}
                    <Link
                      href={`/blog/${getLocalizedSlug(post, locale)}`}
                      className="font-medium underline underline-offset-2 transition-colors hover:text-foreground"
                    >
                      {t("crossLanguageLink")}
                    </Link>
                  </>
                )}
              </p>
            </div>
          ) : (
            !isTranslated && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>{t("translationFallbackNotice")}</p>
              </div>
            )
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground md:gap-4">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                    {(
                      (post.author.displayName ?? post.author.name)?.trim()?.[0] ??
                      "?"
                    ).toUpperCase()}
                  </span>
                )}
                <span className="font-medium text-foreground">
                  {post.author.displayName ?? post.author.name}
                </span>
              </div>
            )}

            <span>
              {t("publishedOn", {
                date: formatPostDate(post.publishedAt ?? post.createdAt, locale),
              })}
            </span>
            {wasEdited && (
              <span>{t("editedOn", { date: formatPostDate(post.updatedAt, locale) })}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 md:gap-4">
            <TopicPills topics={post.topics} />
            <ShareButton title={displayTitle} />
          </div>

          <div className="prose prose-sm mt-8 max-w-none sm:prose-base lg:prose-lg">
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
          />
        </div>

        {hasToc && <TableOfContents headings={headings} />}
      </div>
    </div>
  );
}
