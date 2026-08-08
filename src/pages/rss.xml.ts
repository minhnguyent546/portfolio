import { getCollection, render } from "astro:content";
// Upgrade trap: the container is still exported behind an `experimental_` prefix in
// Astro 7. Re-check this import on every Astro major — a rename breaks the build here,
// which is the failure we want, rather than a feed that quietly loses its bodies.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import rss from "@astrojs/rss";
import config from "@/config";
import { getPostUrl } from "@/utils/getPostPaths";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { dedupeTranslations } from "@/utils/getTranslation";

/** A feed reader serves the body from its own host, so a root-relative image or link
    would resolve against that host and break. */
function absolutize(html: string) {
  const origin = config.site.url.replace(/\/$/, "");
  return html.replace(
    /(<(?:img|a)\b[^>]*?\b(?:src|href)=")\/(?!\/)/g,
    `$1${origin}/`
  );
}

/** KaTeX writes each formula twice: MathML for assistive technology, then styled HTML.
    The site stylesheet hides the MathML copy, but a feed reader loads no CSS and shows
    both, so every formula reads twice and its LaTeX source leaks from the annotation.
    Drop the MathML half and keep the visual one. */
function dropKatexMathml(html: string) {
  return html.replace(
    /<span class="katex-mathml"[^>]*>[\s\S]*?<\/math><\/span>/g,
    ""
  );
}

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = dedupeTranslations(getSortedPosts(posts));

  const container = await AstroContainer.create();

  const items = await Promise.all(
    sortedPosts.map(async post => {
      const { data, id, filePath } = post;
      const { Content } = await render(post);

      return {
        link: getPostUrl(id, filePath, config.site.lang),
        title: data.title,
        description: data.description,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
        content: absolutize(
          dropKatexMathml(await container.renderToString(Content))
        ),
      };
    })
  );

  return rss({
    title: config.site.title,
    description: config.site.description,
    site: config.site.url,
    items,
  });
}
