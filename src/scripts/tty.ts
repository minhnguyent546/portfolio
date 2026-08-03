/**
 * The tty3 shell. Reads the filesystem that the page built at compile time,
 * runs a login that accepts anything, then a command loop over that map.
 *
 * Everything prints through `textContent`. The shell echoes what the visitor
 * typed, so building output as HTML would make `echo` an injection point.
 */
type Vfs = {
  files: Record<string, string>;
  links: Record<string, string>;
};

const HOME = "/home/visitor";
const SESSION_KEY = "tty3";

/** Scrollback carried across a reload. A real tty drops its oldest lines too. */
const MAX_LINES = 500;

type Tone = "warn" | "ok" | "muted";

/** `lines` holds text, never markup: `echo` reflects what the visitor typed. */
type Saved = {
  user: string;
  cwd: string;
  cmdLog: string[];
  lines: [Tone | "" | "link", string][];
};

const root = document.querySelector<HTMLElement>("#tty");
const out = document.querySelector<HTMLElement>("#tty-out");
const promptEl = document.querySelector<HTMLElement>("#tty-prompt");
const input = document.querySelector<HTMLInputElement>("#tty-input");
const payload = document.querySelector<HTMLScriptElement>("#tty-fs");

if (root && out && promptEl && input && payload) {
  const fs = JSON.parse(payload.textContent ?? "{}") as Vfs;
  const homeUrl = root.dataset.home ?? "/";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let user = root.dataset.user ?? "visitor";
  let cwd = HOME;
  let phase: "login" | "password" | "shell" = "login";
  const cmdLog: string[] = [];
  let logAt = 0;
  /** The scrollback as data. Kept beside the DOM so a save needs no scraping. */
  let lines: Saved["lines"] = [];

  const prompt = () => `${user}@portfolio:${short(cwd)}$`;

  /** Oldest first, so the cap drops the lines a visitor has scrolled past. */
  function record(entry: Saved["lines"][number]) {
    lines.push(entry);
    if (lines.length > MAX_LINES) {
      lines = lines.slice(-MAX_LINES);
      while (out!.childElementCount > MAX_LINES)
        out!.firstElementChild!.remove();
    }
  }

  /** Written on each command rather than each line: one write, not forty. */
  function save() {
    if (phase !== "shell") return;
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ user, cwd, cmdLog, lines } satisfies Saved)
      );
    } catch {
      // Private mode throws, and so does a full quota. Losing the scrollback
      // is not worth interrupting the session over.
    }
  }

  /** `/home/visitor/projects` prints as `~/projects`, the way a real shell does. */
  function short(path: string) {
    return path === HOME
      ? "~"
      : path.startsWith(`${HOME}/`)
        ? `~${path.slice(HOME.length)}`
        : path;
  }

  function print(text = "", tone?: Tone) {
    const line = document.createElement("div");
    if (tone) line.className = `tty-${tone}`;
    line.textContent = text;
    out!.append(line);
    root!.scrollTop = root!.scrollHeight;
    record([tone ?? "", text]);
    return line;
  }

  /** Multi-line bodies keep their blank lines, which `print` would collapse. */
  const printBlock = (text: string) =>
    text
      .replace(/\n$/, "")
      .split("\n")
      .forEach(l => print(l));

  /** The label is always the URL, so one field restores the whole line. */
  function printLink(url: string) {
    const line = print();
    lines[lines.length - 1] = ["link", url];
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.textContent = url;
    if (url.startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    line.append("  -> ", anchor);
  }

  /** Resolves `~`, `.`, `..`, and relative segments against the working directory. */
  function resolve(arg: string) {
    const base = arg.startsWith("/")
      ? []
      : arg.startsWith("~")
        ? HOME.split("/").filter(Boolean)
        : cwd.split("/").filter(Boolean);
    const parts = arg.replace(/^~/, "").split("/").filter(Boolean);
    for (const part of parts) {
      if (part === ".") continue;
      if (part === "..") base.pop();
      else base.push(part);
    }
    return `/${base.join("/")}`;
  }

  /** A directory exists when something is prefixed by it. Directories get a `/`. */
  function listDir(dir: string) {
    const prefix = dir === "/" ? "/" : `${dir}/`;
    const names = new Set<string>();
    for (const path of Object.keys(fs.files)) {
      if (!path.startsWith(prefix)) continue;
      const rest = path.slice(prefix.length);
      const cut = rest.indexOf("/");
      names.add(cut === -1 ? rest : `${rest.slice(0, cut)}/`);
    }
    return [...names].sort();
  }

  const COMMANDS = [
    "help",
    "ls",
    "cd",
    "pwd",
    "cat",
    "open",
    "whoami",
    "uname",
    "date",
    "echo",
    "history",
    "clear",
    "exit",
    "sudo",
    "rm",
  ];

  function run(line: string) {
    const [cmd, ...args] = line.trim().split(/\s+/);
    if (!cmd) return;
    const flags = args.filter(a => a.startsWith("-"));
    const rest = args.filter(a => !a.startsWith("-"));

    switch (cmd) {
      case "help":
        print("Commands:");
        print("  exit            return to the site");
        print("  ls [-a] [dir]   list a directory");
        print("  cd [dir]        change directory");
        print("  cat <file>      print a file");
        print("  open <name>     open a page or link (try: open github)");
        print("  pwd whoami date uname -a echo history clear");
        print();
        print("Tab completes. Up and Down walk the history.", "muted");
        return;

      case "ls": {
        const dir = resolve(rest[0] ?? ".");
        const all = flags.includes("-a");
        const entries = listDir(dir).filter(n => all || !n.startsWith("."));
        if (entries.length === 0 && !(dir in fs.files)) {
          print(
            `ls: cannot access '${rest[0] ?? "."}': No such file or directory`,
            "warn"
          );
          return;
        }
        entries.forEach(name =>
          print(name, name.endsWith("/") ? "ok" : undefined)
        );
        return;
      }

      case "cd": {
        const target = rest[0] ? resolve(rest[0]) : HOME;
        if (listDir(target).length === 0) {
          print(`cd: ${rest[0]}: Not a directory`, "warn");
          return;
        }
        cwd = target;
        return;
      }

      case "pwd":
        // The filesystem is built once, so its home is literally
        // `/home/visitor`. Printing the logged-in name keeps `pwd` agreeing
        // with the prompt.
        print(cwd.replace(HOME, `/home/${user}`));
        return;

      case "cat": {
        if (!rest[0]) return print("cat: missing operand", "warn");
        const path = resolve(rest[0]);
        const body = fs.files[path];
        if (body === undefined) {
          const isDir = listDir(path).length > 0;
          print(
            `cat: ${rest[0]}: ${isDir ? "Is a directory" : "No such file or directory"}`,
            "warn"
          );
          return;
        }
        printBlock(body);
        return;
      }

      case "open": {
        if (!rest[0]) return print("open: missing operand", "warn");
        // A bare alias first, so `open github` works without knowing any path.
        const url = fs.links[rest[0]] ?? fs.links[resolve(rest[0])];
        if (!url) {
          print(`open: ${rest[0]}: no such page or link`, "warn");
          print("Try: open github, open blog, open about", "muted");
          return;
        }
        printLink(url);
        setTimeout(() => (location.href = url), 400);
        return;
      }

      case "whoami":
        print(user);
        return;

      case "uname":
        print(
          flags.includes("-a")
            ? `portfolio ${root!.dataset.release ?? ""} tty3 static`
            : "portfolio"
        );
        return;

      case "date":
        print(new Date().toString());
        return;

      case "echo":
        print(args.join(" "));
        return;

      case "history":
        cmdLog.forEach((h, i) => print(`${String(i + 1).padStart(4)}  ${h}`));
        return;

      case "clear":
        out!.replaceChildren();
        lines = [];
        return;

      case "exit":
        print("logout");
        setTimeout(() => (location.href = homeUrl), 300);
        return;

      case "sudo":
        print(
          `${user} is not in the sudoers file. This incident will be reported.`,
          "warn"
        );
        return;

      case "rm":
        print("rm: cannot remove: Read-only file system", "warn");
        return;

      default:
        print(`${cmd}: command not found`, "warn");
    }
  }

  function complete() {
    const value = input!.value;
    const parts = value.split(/\s+/);
    const word = parts[parts.length - 1] ?? "";
    const atCommand = parts.length === 1;
    const dir = word.includes("/") ? resolve(word.replace(/[^/]*$/, "")) : cwd;
    const stem = word.split("/").pop() ?? "";

    // Aliases are only ever arguments to `open`, so offering them after `cd` or
    // `cat` would propose completions that cannot resolve.
    const pool = atCommand
      ? COMMANDS
      : parts[0] === "open"
        ? Object.keys(fs.links).filter(k => !k.startsWith("/"))
        : listDir(dir);
    const hits = [...new Set(pool)].filter(
      n => n.startsWith(stem) && (stem.startsWith(".") || !n.startsWith("."))
    );
    if (hits.length === 0) return;

    if (hits.length === 1) {
      parts[parts.length - 1] =
        word.slice(0, word.length - stem.length) + hits[0]!;
      input!.value = parts.join(" ");
      return;
    }
    print(`${prompt()} ${value}`);
    print(hits.join("  "));
  }

  function submit() {
    const value = input!.value;
    input!.value = "";

    if (phase === "login") {
      print(`portfolio login: ${value}`);
      user = value.trim() || "visitor";
      phase = "password";
      input!.type = "password";
      promptEl!.textContent = "Password:";
      return;
    }

    if (phase === "password") {
      print("Password:");
      input!.type = "text";
      phase = "shell";
      // The login exchange is not scrollback a reload should replay, and the
      // password prompt least of all. The restored screen starts at the motd.
      lines = [];
      welcome();
      promptEl!.textContent = prompt();
      save();
      return;
    }

    print(`${prompt()} ${value}`);
    if (value.trim()) {
      cmdLog.push(value);
      logAt = cmdLog.length;
    }
    run(value);
    promptEl!.textContent = prompt();
    save();
  }

  function welcome() {
    print();
    print("hint: any password works :)", "muted");
    print();
    print(`Last login: ${new Date().toDateString()} on tty3`, "muted");
    printBlock(fs.files["/etc/motd"] ?? "");
    print();
  }

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") return submit();

    if (event.key === "Tab") {
      event.preventDefault();
      if (phase === "shell") complete();
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (phase !== "shell" || cmdLog.length === 0) return;
      event.preventDefault();
      logAt += event.key === "ArrowUp" ? -1 : 1;
      logAt = Math.max(0, Math.min(cmdLog.length, logAt));
      input.value = cmdLog[logAt] ?? "";
      return;
    }

    if (event.ctrlKey && event.key === "c") {
      event.preventDefault();
      print(`${phase === "shell" ? prompt() : ""} ${input.value}^C`.trim());
      input.value = "";
      return;
    }

    if (event.ctrlKey && event.key === "l") {
      event.preventDefault();
      out.replaceChildren();
      lines = [];
      save();
    }
  });

  // A drag that selected text must keep its selection, and a printed link must
  // stay clickable, so only a bare click hands focus back. `pointerup` because
  // on `pointerdown` the selection does not exist yet. Bound to the panel, not
  // to the scrollback, so the blank space under the prompt also takes a click.
  root.addEventListener("pointerup", event => {
    if (!getSelection()?.isCollapsed) return;
    if ((event.target as HTMLElement).closest("a")) return;
    input.focus();
  });

  let resumed: Saved | null = null;
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    resumed = stored ? (JSON.parse(stored) as Saved) : null;
  } catch {
    // Private mode throws on read, and a payload from an older shape throws on
    // parse. A fresh login is the right failure for both.
  }

  input.disabled = false;
  if (resumed) {
    user = resumed.user;
    cwd = resumed.cwd;
    cmdLog.push(...resumed.cmdLog);
    logAt = cmdLog.length;
    phase = "shell";
    // Re-printed through the same path that wrote them, so the restored screen
    // carries no markup the shell would not have produced itself.
    for (const [tone, text] of resumed.lines) {
      if (tone === "link") printLink(text);
      else print(text, tone || undefined);
    }
    promptEl.textContent = prompt();
  } else {
    print("portfolio (tty3)");
    print();
    promptEl.textContent = "portfolio login:";
  }
  if (!reduced) input.focus();
}
