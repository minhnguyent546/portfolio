/**
 * Heading text that remark-toc replaces with the inline TOC. Lives here so
 * the post rail can exclude it: the rail is already that table of contents.
 * remark-toc matches case-insensitively, so the filter does too.
 */
export const TOC_HEADING = "Table of contents|Mục lục";

export const tocHeadingPattern = new RegExp(`^(?:${TOC_HEADING})$`, "i");
