import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import config from "@/config";

export const BLOG_PATH = "src/content/blog";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

/** A labelled outbound link in a publication, competition, or project row. */
const linkList = z.array(
  z.object({
    label: z.string(),
    url: z.url(),
  })
);

const publications = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/publications",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string(),
      authors: z.array(z.string()).nonempty(),
      venue: z.string(),
      date: z.date(),
      /** Bare arXiv id, e.g. "2602.22678". The renderer builds both URLs from it. */
      arxivId: z.string().optional(),
      doi: z.string().optional(),
      links: linkList.default([]),
      thumbnail: image().optional(),
      abstract: z.string(),
      /** Raw entry, copied verbatim by the Cite toggle. */
      bibtex: z.string(),
      order: z.number(),
      draft: z.boolean().default(false),
    }),
});

const competitions = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/competitions",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      venue: z.string(),
      date: z.date(),
      /**
       * How much of `date` is known. "month" renders "October 2025" and keeps
       * the day out of the page, since a YAML date always carries one.
       */
      datePrecision: z.enum(["day", "month"]).default("day"),
      /** Rendered as the award pill. Omit when there is no placement to report. */
      result: z.string().optional(),
      summary: z.string(),
      links: linkList.default([]),
      /** System or pipeline diagram. `alt` is required with it, never optional. */
      figure: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      order: z.number(),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/projects",
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Languages, frameworks, and hardware targets shown as chips. */
    stack: z.array(z.string()).default([]),
    repo: z.url().optional(),
    links: linkList.default([]),
    order: z.number(),
    /** Gives the project its own page in Phase 6. */
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: file("src/content/news.yml"),
  schema: z.object({
    date: z.date(),
    text: z.string(),
    links: linkList.default([]),
  }),
});

const articles = defineCollection({
  loader: file("src/content/articles.yml"),
  schema: z.object({
    title: z.string(),
    /** Original Vietnamese title, when the article was published in Vietnamese. */
    titleVi: z.string().optional(),
    publication: z.string(),
    year: z.number(),
    url: z.url(),
  }),
});

export const collections = {
  blog,
  pages,
  publications,
  competitions,
  projects,
  news,
  articles,
};
