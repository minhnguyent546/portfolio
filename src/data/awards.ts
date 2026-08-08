export type Award = { year: number; title: string };

/**
 * ICPC and Olympiad prizes, newest first. Shared by the homepage timeline and
 * the ⌘K palette, so a search for "Super Cup" lands on `#experience` instead
 * of relying on full-text matches. One row per prize; the timeline groups
 * rows by year.
 */
export const awards: Award[] = [
  {
    year: 2024,
    title: "3rd prize, Vietnam Student Olympiad in Informatics (Super Cup)",
  },
  {
    year: 2023,
    title: "3rd prize, ICPC Vietnam National Programming Contest",
  },
  {
    year: 2022,
    title: "2nd prize, Vietnam Student Olympiad in Informatics (Specialized)",
  },
  {
    year: 2022,
    title: "3rd prize, ICPC Vietnam National Programming Contest",
  },
  { year: 2021, title: "3rd prize, Vietnam Student Olympiad in Informatics" },
];
