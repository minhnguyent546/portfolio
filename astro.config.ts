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
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./astro-paper.config";
import { transformerFileName } from "./src/utils/transformers/fileName";

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
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
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts],
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
      subsets: ["latin"],
    },
    {
      name: "Archivo",
      cssVariable: "--font-archivo",
      provider: fontProviders.google(),
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
      weights: ["400 700"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.google(),
      fallbacks: ["ui-monospace", "monospace"],
      weights: ["400 600"],
      styles: ["normal"],
      subsets: ["latin"],
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
      subsets: ["latin"],
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
