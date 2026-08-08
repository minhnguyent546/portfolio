const THEME_KEY = "theme";
const LIGHT = "light";
const DARK = "dark";
const SYSTEM = "system";
const QUERY = "(prefers-color-scheme: dark)";

type ThemeMode = typeof LIGHT | typeof DARK | typeof SYSTEM;

const prefersDarkQuery = window.matchMedia(QUERY);

function effectiveOf(mode: ThemeMode): string {
  return mode === SYSTEM ? (prefersDarkQuery.matches ? DARK : LIGHT) : mode;
}

// A stored "system" (or nothing) means follow the OS; a stored light/dark is a
// manual choice.
function storedMode(): ThemeMode {
  return (localStorage.getItem(THEME_KEY) as ThemeMode) ?? SYSTEM;
}

// Reuse the values already computed by the inline FOUC-prevention script.
const boot = (
  window as unknown as {
    __theme?: { value: ThemeMode; effective: string };
  }
).__theme;

let mode: ThemeMode = boot?.value ?? storedMode();
let effective: string = boot?.effective ?? effectiveOf(mode);

function reflect(): void {
  const root = document.firstElementChild;
  root?.setAttribute("data-theme", effective);
  root?.setAttribute("data-theme-mode", mode);
  root?.classList.toggle("dark", effective === DARK);

  const btn = document.querySelector<HTMLElement>("#theme-btn");
  if (btn) {
    const label =
      btn.dataset[
        mode === SYSTEM
          ? "modeSystem"
          : mode === DARK
            ? "modeDark"
            : "modeLight"
      ];
    btn.setAttribute(
      "aria-label",
      label ?? btn.getAttribute("aria-label") ?? mode
    );
  }

  // Fill <meta name="theme-color"> with the computed background colour so
  // Android's browser chrome matches the page background.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function persist(): void {
  localStorage.setItem(THEME_KEY, mode);
  reflect();
}

/**
 * Applies the theme inside a same-document View Transition so the browser
 * crossfades between the old and new colour stops instead of snapping. Browsers
 * without View Transitions fall back to the instant switch (the `reflect` call
 * still runs). Reduced-motion readers get the instant switch too, so the toggle
 * stays usable without animating behind their backs.
 */
function apply(update: () => void): void {
  const noMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (noMotion || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(() => {
    update();
  });
}

// Cycle the mode on each click: system → light → dark → system.
function cycle(): void {
  mode = mode === LIGHT ? DARK : mode === DARK ? SYSTEM : LIGHT;
  effective = effectiveOf(mode);
  apply(() => {
    persist();
  });
}

document.querySelector("#theme-btn")?.addEventListener("click", cycle);
reflect();

// Follow OS-level dark/light changes, but only while the mode is "system".
prefersDarkQuery.addEventListener("change", ({ matches }) => {
  if (mode !== SYSTEM) return;
  effective = matches ? DARK : LIGHT;
  reflect();
});
