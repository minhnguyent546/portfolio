/**
 * The tty3 shell. Reads the filesystem that the page built at compile time,
 * runs a login that accepts non-whitespace credentials, then a command loop
 * over that map.
 *
 * Everything prints through `textContent`. The shell echoes what the visitor
 * typed, so building output as HTML would make `echo` an injection point.
 */
type Vfs = {
  files: Record<string, string>;
  links: Record<string, string>;
};

/** Where `buildFs` keyed the content. The login moves it to the real user. */
const BUILD_HOME = "/home/visitor";
const SESSION_KEY = "tty3";

/**
 * The two real accounts, each mapped to the home it owns. No password logs in
 * as either, and neither home can be read. The boot log on `/` types
 * `portfolio login: minhnguyent546`, so the owner has a seat the visitor does
 * not — the locked door is the point.
 */
const LOCKED: Record<string, string> = {
  root: "/root",
  minhnguyent546: "/home/minhnguyent546",
};

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
  /**
   * The content is keyed at `BUILD_HOME`, but the prompt says `~` belongs to
   * whoever logged in. Re-keying the map once at login is what makes the two
   * agree: `pwd` and `ls /home/<name>` then answer from the same paths.
   */
  let home = BUILD_HOME;
  let cwd = home;
  let phase: "login" | "password" | "shell" = "login";
  let loggingOut = false;
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
    if (phase !== "shell" || loggingOut) return;
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

  /** `/home/ada/projects` prints as `~/projects`, the way a real shell does. */
  function short(path: string) {
    return path === home
      ? "~"
      : path.startsWith(`${home}/`)
        ? `~${path.slice(home.length)}`
        : path;
  }

  /** Moves every content path under the name the visitor logged in with. */
  function setHome(name: string) {
    const next = `/home/${name}`;
    if (next === home) return;
    for (const path of Object.keys(fs.files)) {
      if (!path.startsWith(`${home}/`)) continue;
      fs.files[`${next}${path.slice(home.length)}`] = fs.files[path]!;
      delete fs.files[path];
    }
    cwd = cwd.startsWith(home) ? `${next}${cwd.slice(home.length)}` : cwd;
    home = next;
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
    // Matches what `open` does with the same URL, so clicking the printed line
    // and typing the command lead to the same place.
    if (!url.startsWith("mailto:")) {
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
        ? home.split("/").filter(Boolean)
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
    // A locked home holds no files, so it is carried as a path of its own or it
    // would not exist for its parent to list.
    for (const path of Object.keys(fs.files)) {
      if (!path.startsWith(prefix)) continue;
      const rest = path.slice(prefix.length);
      const cut = rest.indexOf("/");
      names.add(cut === -1 ? rest : `${rest.slice(0, cut)}/`);
    }
    for (const home of Object.values(LOCKED)) {
      if (!home.startsWith(prefix)) continue;
      const rest = home.slice(prefix.length);
      names.add(`${rest.split("/")[0]}/`);
    }
    return [...names].sort();
  }

  /**
   * Refused rather than absent. A real account the visitor cannot read still
   * shows up in its parent directory, which is what makes the door worth trying.
   */
  const denied = (path: string) =>
    Object.values(LOCKED).some(
      home => path === home || path.startsWith(`${home}/`)
    );

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

  function logout() {
    if (loggingOut) return;
    loggingOut = true;
    input!.disabled = true;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Storage can be unavailable. The navigation must still complete.
    }
    print("logout");
    setTimeout(() => location.replace(homeUrl), 300);
  }

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
        print("Ctrl+D logs out.", "muted");
        return;

      case "ls": {
        const dir = resolve(rest[0] ?? ".");
        if (denied(dir)) {
          print(
            `ls: cannot open directory '${rest[0] ?? "."}': Permission denied`,
            "warn"
          );
          return;
        }
        const all = flags.includes("-a");
        const entries = listDir(dir).filter(n => all || !n.startsWith("."));
        if (entries.length === 0 && !Object.hasOwn(fs.files, dir)) {
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
        const target = rest[0] ? resolve(rest[0]) : home;
        if (denied(target)) {
          print(`cd: ${rest[0]}: Permission denied`, "warn");
          return;
        }
        if (listDir(target).length === 0) {
          print(`cd: ${rest[0]}: Not a directory`, "warn");
          return;
        }
        cwd = target;
        return;
      }

      case "pwd":
        print(cwd);
        return;

      case "cat": {
        if (!rest[0]) return print("cat: missing operand", "warn");
        const path = resolve(rest[0]);
        if (denied(path)) {
          print(`cat: ${rest[0]}: Permission denied`, "warn");
          return;
        }
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
        // `mailto:` hands off to the mail client without unloading the page, so
        // a tab opened for it would be left behind empty.
        if (url.startsWith("mailto:")) {
          location.href = url;
          return;
        }
        // A new tab, and synchronously, so the keypress that submitted the line
        // is still the gesture the popup blocker sees. Navigating in place would
        // tear down the session the visitor is working in.
        const opened = window.open(url, "_blank", "noopener,noreferrer");
        if (!opened) {
          print("open: blocked. The link above still works.", "muted");
        }
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
        logout();
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
      const name = value.trim();
      if (!name) return;
      print(`portfolio login: ${name}`);
      user = name;
      phase = "password";
      input!.type = "password";
      promptEl!.textContent = "Password:";
      return;
    }

    if (phase === "password") {
      print("Password:");
      input!.type = "text";
      // A locked name and a blank password share one response, so the failure
      // does not disclose whether the account itself was the reason.
      if (!value.trim() || Object.hasOwn(LOCKED, user)) {
        print("Login incorrect", "warn");
        print();
        user = "visitor";
        phase = "login";
        promptEl!.textContent = "portfolio login:";
        return;
      }
      phase = "shell";
      setHome(user);
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
    print("hint: any non-whitespace password works :)", "muted");
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

    if (event.ctrlKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      if (phase === "shell") logout();
      return;
    }

    if (event.ctrlKey && event.key === "c") {
      event.preventDefault();
      print(
        phase === "password"
          ? "^C"
          : `${phase === "shell" ? prompt() : ""} ${input.value}^C`.trim()
      );
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
  // stay clickable, so only a bare click hands focus back. Bound to the panel,
  // not to the scrollback, so the blank space under the prompt also takes a
  // click. `click`, not `pointerup`: a tap emits a compatibility mouse sequence
  // afterwards, and that would move focus back off the input. `click` is the
  // last event of both sequences, and by then the selection exists.
  root.addEventListener("click", event => {
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
  // The store is the visitor's to edit, so a resumed name is checked against
  // the same rules the login uses. Nothing is readable either way, but the
  // prompt must not claim an account the login refuses to hand out.
  if (resumed) {
    if (typeof resumed.user !== "string") {
      resumed = null;
    } else {
      resumed.user = resumed.user.trim();
      if (!resumed.user || Object.hasOwn(LOCKED, resumed.user)) resumed = null;
    }
  }

  input.disabled = false;
  if (resumed) {
    user = resumed.user;
    // Restored first, so a directory saved under the old home is carried over
    // by the same rename that moves the files.
    cwd = resumed.cwd;
    setHome(user);
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
