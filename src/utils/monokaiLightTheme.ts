import type { ShikiConfig } from "astro";

type ShikiTheme = NonNullable<NonNullable<ShikiConfig["themes"]>[string]>;

/**
 * Light-ground counterpart to Sublime Text's Monokai. Keeps the same six
 * Monokai hue roles (magenta keywords, green functions, ochre strings,
 * italic cyan types, violet constants, olive-gray comments) tuned for WCAG AA
 * contrast (4.6–6.2:1) on `#f4f5f6`, pairing with built-in `"monokai"` in
 * dark mode.
 */
export const monokaiLightTheme: ShikiTheme = {
  name: "monokai-light",
  type: "light",
  colors: {
    "editor.background": "#f4f5f6",
    "editor.foreground": "#272822",
  },
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#6e6b5e" },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      settings: { foreground: "#8a6200" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "constant.character",
        "constant.other",
      ],
      settings: { foreground: "#6938c7" },
    },
    {
      scope: [
        "keyword",
        "keyword.operator",
        "storage.modifier",
        "entity.name.tag",
      ],
      settings: { foreground: "#c81e5a" },
    },
    {
      scope: [
        "storage.type",
        "support.type",
        "entity.name.type",
        "support.class",
      ],
      settings: { foreground: "#0c718a", fontStyle: "italic" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call.generic",
        "entity.name.class",
        "entity.other.inherited-class",
        "entity.other.attribute-name",
      ],
      settings: { foreground: "#3f7a12" },
    },
    {
      scope: ["variable.parameter"],
      settings: { foreground: "#b35400", fontStyle: "italic" },
    },
  ],
};
