import { stripMarkdown } from "./strip-markdown";

// Rough average for technical prose — good enough for a "X min" badge,
// not meant to be precise. Rounds up so a very short post still reads
// as "1 min" instead of "0 min".
const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(markdown: string): number {
  const wordCount = stripMarkdown(markdown)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
