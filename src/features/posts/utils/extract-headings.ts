export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

// Same inline-syntax cleanup as stripMarkdown.ts, scoped to a single
// heading line: a TOC entry should show plain text even if the source
// heading is "## Using `useEffect` for **side effects**".
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .trim();
}

// U+0300-U+036F, the "Combining Diacritical Marks" block — built from
// char codes rather than a literal regex range so the accent marks
// themselves never appear as raw bytes in this source file.
const DIACRITIC_MARKS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITIC_MARKS, "") // strip accents left behind by NFD decomposition
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Regex over the raw string, not a real markdown parser — deliberate,
// same "dependency-free" trade-off as stripMarkdown.ts. Known gap: a
// heading inside a blockquote ("> ## Foo") isn't recognized, since it
// doesn't start the line with "#".
export function extractHeadings(markdown: string): Heading[] {
  const withoutCodeFences = markdown.replace(/```[\s\S]*?```/g, "");
  const slugCounts = new Map<string, number>();
  const headings: Heading[] = [];

  for (const match of withoutCodeFences.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
    const level = match[1].length as 2 | 3;
    const text = cleanInlineMarkdown(match[2]);
    if (!text) continue;

    const baseSlug = slugify(text) || `heading-${headings.length + 1}`;
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);
    const id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

    headings.push({ id, text, level });
  }

  return headings;
}
