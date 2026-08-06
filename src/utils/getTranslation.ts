import type { CollectionEntry } from "astro:content";

/**
 * Finds the other language of a post. `translationOf` is declared on one post
 * of the pair, so a match is either the target of this post's own link or the
 * post that points back at it. A link to the same language is not a
 * translation, so it is ignored.
 */
export function getTranslation(
  post: CollectionEntry<"blog">,
  posts: CollectionEntry<"blog">[]
): CollectionEntry<"blog"> | undefined {
  const isCandidate = (candidate: CollectionEntry<"blog">) =>
    candidate.id !== post.id && candidate.data.lang !== post.data.lang;

  // The post's own link wins, so the pair agrees on its two halves even when
  // another post claims the same target.
  const target = post.data.translationOf?.id;
  const declared = posts.find(
    candidate => candidate.id === target && isCandidate(candidate)
  );
  if (declared) return declared;

  const inbound = posts.filter(
    candidate =>
      candidate.data.translationOf?.id === post.id && isCandidate(candidate)
  );
  if (inbound.length > 1) {
    throw new Error(
      `"${post.id}" is claimed as the translation of ${inbound
        .map(entry => `"${entry.id}"`)
        .join(" and ")}. A post can pair with one other post.`
    );
  }
  return inbound[0];
}

/**
 * Drops the non-English half of every translated pair, so one article holds one
 * row in a listing. A pair with no English side keeps the post it has.
 */
export function dedupeTranslations(
  posts: CollectionEntry<"blog">[]
): CollectionEntry<"blog">[] {
  return posts.filter(post => {
    if (post.data.lang === "en") return true;
    const translation = getTranslation(post, posts);
    return translation?.data.lang !== "en";
  });
}
