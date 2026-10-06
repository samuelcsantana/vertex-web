import { stripMarkdown } from "./strip-markdown";

const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(markdown: string): number {
  const wordCount = stripMarkdown(markdown)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
