import type { CollectionEntry } from "astro:content";

const WORDS_PER_MINUTE = 200;

/**
 * Reading-time estimate from the raw Markdown body, rounded up, never zero.
 * Non-prose blocks are excluded before counting — the same convention the
 * npm `reading-time` package uses for its word bounds: fenced code, inline
 * code, TeX math, images, link URLs, HTML tags and markdown punctuation do
 * not read like prose. A low rate (200 vs Medium's 265) keeps estimates
 * conservative for math-dense posts.
 */
export function getReadingTime(post: CollectionEntry<"blog">): number {
  const clean = (post.body ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>\n]+>/g, " ")
    .replace(/[*_#>|]+/g, " ");
  const words = clean.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
