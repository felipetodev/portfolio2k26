"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  commands,
  files,
  themes,
  type ThemeName,
} from "@/utils/terminal-data";

const THEME_KEY = "terminal-theme";

// Saved theme lives in localStorage; useSyncExternalStore keeps SSR safe.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function readTheme(): ThemeName {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && saved in themes) return saved as ThemeName;
  } catch {}
  return "default";
}
function applyTheme(name: ThemeName) {
  try {
    localStorage.setItem(THEME_KEY, name);
  } catch {}
  listeners.forEach((cb) => cb());
}

// Argument autocompletion: command → possible values.
const ARGS: Record<string, string[]> = {
  cat: files.map((f) => f.name),
  themes: Object.keys(themes),
};

type Entry = { id?: number; cmd: string; out: string[] };

function linkify(line: string) {
  return line.split(/(https?:\/\/\S+)/).map((part, i) =>
    i % 2 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-70"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

const WELCOME = ['Welcome! Type "help" to see what you can run.'];

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const theme = useSyncExternalStore<ThemeName>(subscribe, readTheme, () => "default");

  // scroll inside the log only (never the page)
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  async function run(raw: string) {
    const [name, ...args] = raw.trim().split(/\s+/);
    if (!name) return;
    setHistory((h) => [...h, raw]);
    setCursor(null);
    const command = commands[name.toLowerCase()];
    if (!command) {
      setEntries((e) => [
        ...e,
        { cmd: raw, out: [`command not found: ${name}. Try "help".`] },
      ]);
      return;
    }
    const result = command.run(args);
    if (result === "clear") return setEntries([]);
    if (Array.isArray(result)) {
      return setEntries((e) => [...e, { cmd: raw, out: result }]);
    }
    if (!(result instanceof Promise)) {
      applyTheme(result.theme);
      return setEntries((e) => [...e, { cmd: raw, out: result.lines }]);
    }
    const id = Date.now();
    setEntries((e) => [...e, { id, cmd: raw, out: ["loading..."] }]);
    const out = await result;
    setEntries((e) =>
      Array.isArray(out)
        ? e.map((en) => (en.id === id ? { ...en, out } : en))
        : out === "clear"
          ? []
          : e,
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown" && cursor !== null) {
      e.preventDefault();
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setValue("");
      } else {
        setCursor(i);
        setValue(history[i]);
      }
    } else if (e.key === "Tab" && value.includes(" ")) {
      e.preventDefault();
      const [cmd, partial = ""] = value.split(/\s+/);
      const match = ARGS[cmd]?.find((a) => a.startsWith(partial));
      if (match) setValue(`${cmd} ${match}`);
    } else if (e.key === "Tab" && value) {
      e.preventDefault();
      const match = Object.entries(commands).find(
        ([name, c]) => !c.hidden && name.startsWith(value.toLowerCase()),
      )?.[0];
      if (match) setValue(match);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  return (
    <section
      aria-label="Interactive terminal"
      className="row-7 p-2 md:p-5 text-black"
    >
      <div
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        style={{
          "--t-bg": themes[theme].bg,
          "--t-fg": themes[theme].fg,
          "--t-muted": themes[theme].muted,
          "--t-border": themes[theme].border,
        } as React.CSSProperties}
        className="border border-dashed border-(--t-border) bg-(--t-bg) text-xs transition-colors duration-300 motion-reduce:transition-none"
      >
        <div className="flex items-center gap-2 border-b border-dashed border-(--t-border) px-4 py-2 text-(--t-muted)">
          <span aria-hidden>●</span>
          <span>felipeto@portfolio ~ </span>
        </div>
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          className="h-72 overflow-y-auto px-4 py-3 leading-relaxed text-(--t-fg)"
        >
          {WELCOME.map((l) => (
            <p key={l} className="text-(--t-muted)">{l}</p>
          ))}
          {entries.map((en, i) => (
            <div key={i} className="mt-2">
              <p><span aria-hidden className="text-(--t-muted)">❯ </span>{en.cmd}</p>
              {en.out.map((line, j) => (
                <pre key={j} className="whitespace-pre-wrap font-mono">
                  {line ? linkify(line) : " "}
                </pre>
              ))}
            </div>
          ))}
          <label className="mt-2 flex items-center gap-2">
            <span aria-hidden className="text-(--t-muted)">❯</span>
            <span className="sr-only">Enter a command</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="type help"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-(--t-muted) focus-visible:underline"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
