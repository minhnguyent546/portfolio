import type { CollectionEntry } from "astro:content";

const WORDS_PER_MINUTE = 200;

/**
 * Reading-time estimate from the raw Markdown body, rounded up, never zero.
 * Fenced code blocks are excluded: a code-heavy post should not read as
 * longer than its prose.
 */
export function getReadingTime(post: CollectionEntry<"blog">): number {
  const prose = post.body?.replace(/```[\s\S]*?```/g, " ") ?? "";
  const words = prose.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
