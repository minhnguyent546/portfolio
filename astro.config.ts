import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import rehypeCallouts from "rehype-callouts";
import rehypeKatex from "rehype-katex";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import config from "./astro-paper.config";
import { rehypeIgnoreMathml } from "./src/utils/rehypeIgnoreMathml";
import { transformerFileName } from "./src/utils/transformers/fileName";

/** Matched case-insensitively as `^(…)$` by `mdast-util-heading-range`. */
const TOC_HEADING = "Table of contents|Mục lục";

/** Easter eggs. No link points at them, so the sitemap must not either. */
const HIDDEN_ROUTES = ["/photon-sphere/", "/tty3/"];

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        (config.features?.showArchives !== false ||
          !page.endsWith("/archives/")) &&
        !HIDDEN_ROUTES.some(route => page.endsWith(route)),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkMath,
        [remarkToc, { heading: TOC_HEADING }],
        // One registration, not one per language: `unified` keys plugins by
        // function identity, so a second `remarkCollapse` merges its options
        // into the first instead of running beside it.
        [
          remarkCollapse,
          {
            test: TOC_HEADING,
            summary: (heading: string) =>
              heading.trim() === "Mục lục"
                ? "Mở Mục lục"
                : "Open Table of contents",
          },
        ],
      ],
      rehypePlugins: [rehypeKatex, rehypeIgnoreMathml, rehypeCallouts],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          "**/.agents/**",
          "**/.claude/**",
          "**/.plans/**",
          "**/.playwright-mcp/**",
          "**/.research/**",
        ],
      },
    },
  },
  // Variable ranges, not discrete weights: one file per family covers the range.
  // `opsz` is deliberately omitted from Newsreader — it more than doubles the
  // woff2 (57KB -> 129KB) for a 14-40px scale that needs no optical compensation.
  fonts: [
    {
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      provider: fontProviders.google(),
      fallbacks: ["Georgia", "serif"],
      weights: ["400 700"],
      styles: ["normal", "italic"],
      subsets: ["latin", "vietnamese"],
    },
    {
      name: "Archivo",
      cssVariable: "--font-archivo",
      provider: fontProviders.google(),
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin", "vietnamese"],
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.google(),
      fallbacks: ["ui-monospace", "monospace"],
      weights: ["400 600"],
      styles: ["normal"],
      subsets: ["latin", "vietnamese"],
    },
    // Build-time only: satori cannot parse woff2, so the OG routes read these
    // static ttf instances. Kept as a separate family so the `ttf` @font-face
    // blocks never enter the stylesheet the browser uses — no <Font> component
    // references this variable and no CSS resolves it.
    {
      name: "Archivo",
      cssVariable: "--font-archivo-og",
      provider: fontProviders.google(),
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin", "vietnamese"],
      formats: ["ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
