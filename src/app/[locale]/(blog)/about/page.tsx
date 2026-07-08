import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTranslations } from "next-intl/server";

import { getAboutContent } from "@/features/about/api/about-service";

export default async function AboutPage() {
  const about = await getAboutContent();
  const t = await getTranslations("Navigation");

  // The About content is expected to open with its own "# Heading" (and is
  // styled/sized as one) — in that case it already is the page's real h1
  // and a second one would just duplicate it in the heading outline. The
  // sr-only fallback below only renders when the content doesn't start
  // with a heading, so there's always exactly one h1, never zero or two.
  // Unlike the blog post page there's no separate title field to draw an
  // h1 from, and remapping the body's own headings down a level would
  // visibly shrink the intended opening heading — so that approach (used
  // on the post page) isn't used here.
  const startsWithHeading = /^#{1,6}\s+/.test((about?.content ?? "").trimStart());

  return (
    <article className="prose prose-invert lg:prose-lg mx-auto max-w-3xl px-4 py-12">
      {!startsWithHeading && <h1 className="sr-only">{t("about")}</h1>}
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {about?.content ?? ""}
      </ReactMarkdown>
    </article>
  );
}
