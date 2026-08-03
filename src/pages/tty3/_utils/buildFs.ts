import type { CollectionEntry } from "astro:content";
import config from "@/config";
import { formatDate } from "@/utils/formatDate";

/**
 * The shell's filesystem. A flat map, not a tree: a directory exists when a
 * path is prefixed by it, so `ls` and `cd` need no walker and no node type.
 */
export type Vfs = {
  /** Absolute path to file body. */
  files: Record<string, string>;
  /** Absolute path or bare alias to a destination for `open`. */
  links: Record<string, string>;
};

export const HOME = "/home/visitor";

type Link = { label: string; url: string };

/** Trailing blank lines make `cat` output ragged, so every body is trimmed. */
const block = (lines: (string | false | undefined)[]) =>
  lines.filter(line => line !== false && line !== undefined).join("\n") + "\n";

const linkLines = (links: Link[]) =>
  links.length > 0
    ? ["", "Links:", ...links.map(l => `  ${l.label}  ${l.url}`)]
    : [];

/**
 * Markdown link syntax is noise in a terminal. `[text](url)` becomes
 * `text <url>`, which is how a plain-text mail body would carry the same link.
 */
const flattenLinks = (markdown: string) =>
  markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 <$2>");

/** The entry body without frontmatter, or nothing when the entry has none. */
const bodyLines = (body: string | undefined) => {
  const text = flattenLinks(body?.trim() ?? "");
  return text ? ["", text] : [];
};

export function buildFs(content: {
  publications: CollectionEntry<"publications">[];
  competitions: CollectionEntry<"competitions">[];
  projects: CollectionEntry<"projects">[];
  news: CollectionEntry<"news">[];
  articles: CollectionEntry<"articles">[];
  about: CollectionEntry<"pages"> | undefined;
  /** Site-relative URLs the shell can `open`, keyed by alias. */
  routes: Record<string, string>;
}): Vfs {
  const files: Record<string, string> = {};
  const links: Record<string, string> = { ...content.routes };

  for (const { id, data, body } of content.publications) {
    // Rebuilt from the id rather than stored, so an id change cannot leave a
    // stale URL. Same construction as PublicationRow.astro.
    const idLinks: Link[] = [
      ...(data.arxivId
        ? [
            {
              label: `arXiv:${data.arxivId}`,
              url: `https://arxiv.org/abs/${data.arxivId}`,
            },
            { label: "PDF", url: `https://arxiv.org/pdf/${data.arxivId}` },
          ]
        : []),
      ...(data.doi
        ? [{ label: "DOI", url: `https://doi.org/${data.doi}` }]
        : []),
    ];
    files[`${HOME}/publications/${id}.txt`] = block([
      data.title,
      "",
      `Authors:  ${data.authors.join(", ")}`,
      `Venue:    ${data.venue}`,
      `Date:     ${formatDate(data.date).label}`,
      "",
      data.abstract.trim(),
      ...bodyLines(body),
      ...linkLines([...idLinks, ...data.links]),
    ]);
    files[`${HOME}/publications/${id}.bib`] = `${data.bibtex.trim()}\n`;
  }

  for (const { id, data, body } of content.competitions) {
    files[`${HOME}/competitions/${id}.txt`] = block([
      data.title,
      "",
      `Venue:   ${data.venue}`,
      `Date:    ${formatDate(data.date, data.datePrecision).label}`,
      data.result !== undefined && `Result:  ${data.result}`,
      "",
      data.summary.trim(),
      ...bodyLines(body),
      ...linkLines(data.links),
    ]);
  }

  for (const { id, data, body } of content.projects) {
    files[`${HOME}/projects/${id}.txt`] = block([
      data.title,
      "",
      data.stack.length > 0 && `Stack:  ${data.stack.join(", ")}`,
      data.repo !== undefined && `Repo:   ${data.repo}`,
      "",
      data.summary.trim(),
      ...bodyLines(body),
      ...linkLines(data.links),
    ]);
  }

  files[`${HOME}/news.txt`] = block(
    content.news.flatMap(({ data }, index) => [
      ...(index > 0 ? [""] : []),
      formatDate(data.date).label,
      `  ${data.text.trim().replace(/\s+/g, " ")}`,
      ...data.links.map(l => `  ${l.label}: ${l.url}`),
    ])
  );

  files[`${HOME}/writing/vnoi-magazine.txt`] = block(
    content.articles.flatMap(({ data }, index) => [
      ...(index > 0 ? [""] : []),
      `${data.year}  ${data.title}`,
      data.titleVi !== undefined && `      ${data.titleVi}`,
      `      ${data.publication}`,
      `      ${data.url}`,
    ])
  );

  if (content.about) {
    files[`${HOME}/about.txt`] = block([
      content.about.data.title,
      "",
      flattenLinks(content.about.body?.trim() ?? ""),
    ]);
  }

  files[`${HOME}/contact.txt`] = block([
    "Reach me at any of these.",
    "",
    ...config.socials.map(({ name, url }) => `  ${name.padEnd(14)}${url}`),
  ]);

  // What a .plan file held on a real finger daemon: what the person is working
  // on now. The newest news entry is exactly that, so the joke needs no invention.
  const latest = content.news[0];
  if (latest) {
    files[`${HOME}/.plan`] = block([
      "Currently:",
      "",
      `  ${latest.data.text.trim().replace(/\s+/g, " ")}`,
      "",
      `  -- ${formatDate(latest.data.date).label}`,
    ]);
  }

  files["/etc/motd"] = block([
    `${config.site.title} -- ${config.site.description}`,
    "",
    "Type 'help' for the command list.",
    "Type 'exit' to return to the site.",
  ]);

  for (const { name, url } of config.socials) links[name] = url;

  return { files, links };
}
