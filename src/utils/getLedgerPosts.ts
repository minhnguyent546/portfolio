import type { CollectionEntry } from "astro:content";
import type { Topic } from "@/data/topics";
import { dedupeTranslations } from "./getTranslation";
import { postFilter } from "./postFilter";

/**
 * The posts the blog ledger lists: one row per article, newest first.
 *
 * Sorted on `pubDatetime` alone, unlike `getSortedPosts`, because the ledger
 * groups by publication year. A post edited years after it was written stays
 * in the year it belongs to.
 */
export function getLedgerPosts(posts: CollectionEntry<"blog">[]) {
  return dedupeTranslations(posts.filter(postFilter)).sort(
    (a, b) => b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
  );
}

/** Post count per topic. A topic with no post is absent, never zero. */
export function getTopicCounts(posts: CollectionEntry<"blog">[]) {
  const counts = new Map<Topic, number>();
  for (const post of posts) {
    counts.set(post.data.topic, (counts.get(post.data.topic) ?? 0) + 1);
  }
  return counts;
}
