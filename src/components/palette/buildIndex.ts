import type { CollectionEntry } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";
import { awards } from "@/data/awards";
import { TOPIC_LABELS, TOPICS } from "@/data/topics";
import { formatDate } from "@/utils/formatDate";
import { getTopicCounts } from "@/utils/getLedgerPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import { dedupeTranslations, getTranslation } from "@/utils/getTranslation";

/**
 * One row in the palette. The keys are single letters because the payload is
 * inlined into every page, and the field names would otherwise outweigh the
 * content.
 */
export type PaletteEntry = {
  /** Display label. */
  t: string;
  /** Secondary line. Empty when the entry has none. */
  d: string;
  /** Group the row is listed under. */
  k: PaletteGroup;
  /** Destination. */
  u: string;
  /** Extra searchable text that is matched but never shown. */
  a?: string;
  /** URL of the translation this row stands in for. */
  v?: string;
};

export type PaletteGroup =
  | "post"
  | "publication"
  | "competition"
  | "experience"
  | "project"
  | "news"
  | "page";

/** A homepage section, keyed by the anchor it scrolls to. */
type Section = { id: string; label: string; aliases?: string };

/** A site route that is not built from a collection. */
type Route = { label: string; url: string };

export function buildIndex(content: {
  posts: CollectionEntry<"blog">[];
  articles: CollectionEntry<"articles">[];
  publications: CollectionEntry<"publications">[];
  competitions: CollectionEntry<"competitions">[];
  experience: CollectionEntry<"experience">[];
  projects: CollectionEntry<"projects">[];
  news: CollectionEntry<"news">[];
  sections: Section[];
  /** Prepended with the homepage path to make each section anchor. */
  homeUrl: string;
  /** Blog index URL, used for VNOI Magazine articles listed on `/blog`. */
  blogUrl: string;
  routes: Route[];
  locale: string;
}): PaletteEntry[] {
  const entries: PaletteEntry[] = [];

  // One row per article, not per language: the pair already collapses to the
  // English side in every other listing. The title of the half that is dropped
  // still has to match, or a Vietnamese reader searching the Vietnamese title
  // finds nothing.
  const shown = dedupeTranslations(content.posts);
  const dropped = new Map(
    content.posts
      .filter(post => !shown.includes(post))
      .map(post => [
        getTranslation(post, content.posts)?.id,
        { title: post.data.title, url: getPostUrl(post.id, post.filePath) },
      ])
  );

  for (const post of shown) {
    const other = dropped.get(post.id);
    const terms = [...post.data.tags, TOPIC_LABELS[post.data.topic]].join(" ");
    entries.push({
      t: post.data.title,
      d: post.data.description,
      k: "post",
      u: getPostUrl(post.id, post.filePath),
      a: other ? `${other.title} ${terms}` : terms,
      ...(other && { v: other.url }),
    });
  }

  for (const { data } of content.articles) {
    entries.push({
      t: data.title,
      d: `${data.publication} · ${data.year}`,
      k: "post",
      u: `${content.blogUrl}#vnoi-magazine`,
      ...(data.titleVi && { a: data.titleVi }),
    });
  }

  // A topic with no post has no page, so it gets no row either.
  const topicCounts = getTopicCounts(shown);
  for (const topic of TOPICS.filter(topic => topicCounts.has(topic))) {
    entries.push({
      t: TOPIC_LABELS[topic],
      d: "",
      k: "page",
      u: getRelativeLocaleUrl(content.locale, `blog/topic/${topic}`),
    });
  }

  for (const { data } of content.publications) {
    entries.push({
      t: data.shortTitle,
      d: data.venue,
      k: "publication",
      u: `${content.homeUrl}#publications`,
      a: `${data.title} ${data.authors.join(" ")} ${data.abstract}`,
    });
  }

  for (const { data } of content.competitions) {
    entries.push({
      t: data.title,
      d: data.result ?? data.venue,
      k: "competition",
      u: `${content.homeUrl}#competitions`,
      a: `${data.summary.replace(/\*\*([^*]+)\*\*/g, "$1")} ${data.venue}`,
    });
  }

  for (const { data } of content.experience) {
    entries.push({
      t: data.role,
      d: data.organization,
      k: "experience",
      u: `${content.homeUrl}#experience`,
      a: `${data.period} ${data.orgNote ?? ""} ${data.highlights.join(" ")}`,
    });
  }

  // The awards have no rows of their own, so they ride the Experience group
  // and link to the Education & Honors section. A search for "Super Cup" or
  // "ICPC" lands on the section instead of opening at the page top.
  for (const award of awards) {
    entries.push({
      t: award.title,
      d: String(award.year),
      k: "experience",
      u: `${content.homeUrl}#education`,
    });
  }

  for (const { data } of content.projects) {
    entries.push({
      t: data.title,
      d: data.summary,
      k: "project",
      u: `${content.homeUrl}#projects`,
      a: [...data.stack, ...data.aliases].join(" "),
    });
  }

  for (const { data } of content.news) {
    entries.push({
      t: data.text.trim(),
      d: formatDate(data.date, "month-short").label,
      k: "news",
      u: `${content.homeUrl}#news`,
    });
  }

  for (const { label, url } of content.routes) {
    entries.push({ t: label, d: "", k: "page", u: url });
  }

  for (const { id, label, aliases } of content.sections) {
    entries.push({
      t: label,
      d: "",
      k: "page",
      u: `${content.homeUrl}#${id}`,
      ...(aliases && { a: aliases }),
    });
  }

  return entries;
}
