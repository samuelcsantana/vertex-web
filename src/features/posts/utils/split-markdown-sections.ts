import { extractHeadings } from "./extract-headings";

export interface MarkdownSection {
  id: string;
  heading: string;
  body: string;
}

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
