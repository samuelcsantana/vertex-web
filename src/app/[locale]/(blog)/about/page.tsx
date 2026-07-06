import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getAboutContent } from "@/features/about/api/about-service";

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <article className="prose prose-invert lg:prose-lg mx-auto max-w-3xl px-4 py-12">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {about?.content ?? ""}
      </ReactMarkdown>
    </article>
  );
}
