/**
 * The coarse browsing axis for blog posts, alongside the free-form `tags`.
 * Closed on purpose: a post declares exactly one, and the schema rejects
 * anything else, so a new subject cannot drift in under a spelling of its own.
 * Each value is a URL segment under `/blog/topic/`.
 */
export const TOPICS = ["algorithms", "llm", "nlp", "systems"] as const;

export type Topic = (typeof TOPICS)[number];

/** Display labels stay English — the site shell is English, only posts are not. */
export const TOPIC_LABELS: Record<Topic, string> = {
  algorithms: "Algorithms",
  llm: "LLM",
  nlp: "NLP",
  systems: "Systems",
};
