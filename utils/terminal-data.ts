import { triggerSystemAlert } from "./system-events";

type Output = string[] | "clear" | { lines: string[]; theme: ThemeName };

// Terminal color themes (applied as CSS variables on the terminal).
export const themes = {
  default: { bg: "#f2f0ef", fg: "#374151", muted: "#6b7280", border: "rgb(107 114 128 / 0.3)" },
  dracula: { bg: "#282a36", fg: "#f8f8f2", muted: "#bd93f9", border: "#44475a" },
  matrix: { bg: "#0d0d0d", fg: "#33ff66", muted: "#1a9c3e", border: "#1a3d24" },
  claude: { bg: "#1f1e1d", fg: "#f5f4ef", muted: "#d97757", border: "#3d3a36" },
} as const;
export type ThemeName = keyof typeof themes;

export type Command = {
  description: string;
  hidden?: boolean; // easter eggs: work, but not listed in help
  run: (args: string[]) => Output | Promise<Output>;
};

// Fake files shown by `ls` (and autocompleted by `cat`).
export const files = [
  { perms: "drwxr-xr-x", name: "side-projects-never-finished/" },
  { perms: "drwxr-xr-x", name: "node_modules/", note: "(heavier than a black hole)" },
  { perms: "-rw-r--r--", name: "elden-ring-deaths.log", note: "(2.4 GB and growing)" },
  { perms: "-rw-r--r--", name: "TODO.md", note: "(last edited: 2019)" },
  { perms: "-rw-r--r--", name: "fix-later.ts" },
  { perms: "-rw-r--r--", name: "final_v2_FINAL_ahora_si.tsx" },
  { perms: "-r--------", name: "secrets.env", note: "(...👀)" },
];

export const commands: Record<string, Command> = {
  help: {
    description: "list available commands",
    run: () => [
      ...Object.entries(commands)
        .filter(([, c]) => !c.hidden)
        .map(
        ([name, c]) => `  ${name.padEnd(10)} ${c.description}`,
      ),
      "",
      "tip: use ↑/↓ for history and tab to autocomplete",
    ],
  },
  whoami: {
    description: "who am I",
    run: () => ["felipe ossandon, AI engineer enthusiast"],
  },
  projects: {
    description: "things I've built",
    run: () => ["  🌐 https://github.com/felipetodev"],
  },
  work: {
    description: "where I work",
    run: () => ["currently working for Globant @ British Airways ✈️"],
  },
  fun: {
    description: "a curiosity",
    run: () => ["currently an Elden Ring player"],
  },
  music: {
    description: "what I'm listening to on Spotify",
    run: async () => {
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) throw new Error();
        const song = (await res.json()) as {
          playing: boolean;
          title: string;
          artist: string;
          url: string;
        };
        return [
          song.playing ? "♫ now playing" : "♫ last played",
          `  ${song.title} — ${song.artist}`,
          `  ${song.url}`,
        ];
      } catch {
        return ["spotify is taking a break, try again later."];
      }
    },
  },
  ls: {
    description: "list my files",
    hidden: true,
    run: () =>
      files.map(({ perms, name, note }) =>
        `${perms}  ${note ? `${name.padEnd(31)}${note}` : name}`,
      ),
  },
  cat: {
    description: "read a file",
    hidden: true,
    run: ([file]) => {
      if (!file) return ["cat: missing file. try `ls` 👀"];
      if (file === "secrets.env") {
        return [
          "OPENAI_API_KEY=nice-try-buddy",
          "BANK_PASSWORD=hunter2",
          "ELDEN_RING_BOSS_STRATEGY=panic-roll",
          "REAL_SECRET=i-still-google-how-to-center-a-div",
          "",
          "# ⚠️  this incident will be reported to my mom",
        ];
      }
      return ["what are you looking for? 👀"];
    },
  },
  themes: {
    description: "change the terminal colors",
    run: ([name]) => {
      const list = Object.keys(themes).map((t) => `  ${t}`);
      if (!name) return ["available themes:", ...list, "", "usage: themes <name>"];
      if (!(name in themes)) return [`unknown theme: ${name}`, ...list];
      return { lines: [`theme set to ${name} ✨`], theme: name as ThemeName };
    },
  },
  sudo: {
    description: "run as root",
    hidden: true,
    run: (args) => {
      if (args.join(" ").startsWith("rm -rf")) {
        triggerSystemAlert();
        return [
          "[sudo] password for felipeto: ********",
          "removing /usr ... done",
          "removing /home/felipeto/side-projects ... done",
          "removing /portfolio ... ",
          "",
          "⚠️  CRITICAL: check the system monitor ↑",
        ];
      }
      return ["felipeto is not in the sudoers file. This incident will be reported."];
    },
  },
  clear: { description: "clear the screen", run: () => "clear" },
};
