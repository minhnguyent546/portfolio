// Vite resolves `?raw` to the file's text. Astro's generated `.astro/env.d.ts`
// declares only the `astro:env` modules, and no `vite/client` reference reaches
// this project, so the suffixed specifier has no type without this.
declare module "*.glsl?raw" {
  const source: string;
  export default source;
}
