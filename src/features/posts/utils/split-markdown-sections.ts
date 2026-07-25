import { extractHeadings } from "./extract-headings";

export interface MarkdownSection {
  id: string;
  heading: string;
  body: string;
}

// Splits a markdown string on its top-level "##" headings so About can
// render each as its own card instead of one continuous prose block.
// Reuses extractHeadings for the id/text of each section instead of
// re-slugifying here, so a section's card id always matches whatever
// <TableOfContents> renders for it — the same "single source of slugs"
// invariant the post page already relies on.
//
// Known gap (same trade-off extractHeadings itself documents): a "##"
// inside a code fence would desync this split from extractHeadings' own
// fence-stripped count. About content is admin-authored, not user input,
// so this is accepted rather than worth a real markdown-AST parser.
export function splitMarkdownSections(markdown: string): {
  intro: string;
  sections: MarkdownSection[];
} {
  const level2Headings = extractHeadings(markdown).filter(
    (heading) => heading.level === 2
  );
  const chunks = markdown.split(/^##\s+.+$/gm);

  return {
    intro: (chunks[0] ?? "").trim(),
    sections: level2Headings.map((heading, index) => ({
      id: heading.id,
      heading: heading.text,
      body: (chunks[index + 1] ?? "").trim(),
    })),
  };
}
