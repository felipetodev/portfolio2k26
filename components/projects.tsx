"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRightIcon,
  ChevronIcon,
  FileIcon,
  FileInputIcon,
  FolderClosedIcon,
  FolderOpenIcon,
} from "./icons";
import { projects } from "@/utils/constants";
import useMeasure from "react-use-measure";

const BICE_REPO = "https://github.com/felipetodev/bice-cli"; // TODO: confirm repo URL
const BICE_COMMAND = `git clone ${BICE_REPO}`;

function LatestProject() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);

  // Play only while on screen (the demo is a large file). Under reduced
  // motion it never autoplays; native controls are shown instead.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BICE_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="min-w-0 bg-surface border border-black/40 overflow-hidden text-xs text-gray-700">
      <div className="flex items-center gap-3 border-b border-black/20 px-3 h-8">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full border border-black/30" />
          <span className="size-2.5 rounded-full border border-black/30" />
          <span className="size-2.5 rounded-full border border-black/30" />
        </div>
        <span className="text-[10px] text-gray-500 truncate">bice-cli — zsh</span>
        <a
          href={BICE_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] text-gray-500 underline decoration-black/30 underline-offset-4 hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          github ↗
        </a>
      </div>

      <p className="px-4 pt-3 leading-relaxed text-gray-500">
        <span className="select-none"># </span>
        latest side-project: Unofficial CLI to manage your BICE bank account
        just vibing from your terminal.
      </p>

      <div className="px-4 py-3">
        <video
          ref={videoRef}
          loop
          src="/bice-cli.mp4"
          muted
          playsInline
          preload="metadata"
          aria-label="bice-cli demo"
          className="w-full max-h-[360px] object-cover object-center border border-dashed border-gray-500/20"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-black/20 px-4 h-10">
        <code className="min-w-0 flex-1 truncate">
          <span className="select-none text-gray-500">$ </span>
          {BICE_COMMAND}
        </code>
        <button
          type="button"
          onClick={copy}
          className="cursor-pointer shrink-0 border border-black/40 px-2 py-0.5 text-[10px] transition-[background-color,transform] duration-150 ease-out hover:bg-page active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <span aria-live="polite">{copied ? "copied ✓" : "copy"}</span>
        </button>
      </div>
    </div>
  );
}

function ProjectWorkTree({ markdown }: { markdown: string }) {
  const [view, setView] = useState<"workTree" | "markdown">("workTree");
  const [ref, bounds] = useMeasure();
  const [activeTab, setActiveTab] = useState<string | number | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setView("workTree");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [view]);

  const type = {
    markdown: (
      <div className="px-8 py-5.5">
        <p className="text-xs text-gray-600 leading-relaxed">
          {markdown.split("\n").map((line, index) => (
            <span
              key={index}
              className={`
              ${line.startsWith("#") ? "font-bold text-primary" : ""}
              ${line.startsWith("<!--") ? "text-gray-800 italic" : ""}
            `}
            >
              {line}
              <br />
            </span>
          ))}
        </p>
        <div className="sticky flex justify-center bottom-4">
          <button
            onClick={() => setView("workTree")}
            className="cursor-pointer px-2.5 text-black bg-surface border border-black/40 hover:bg-page transition-colors shadow-sm"
          >
            Back [esc]
          </button>
        </div>
      </div>
    ),
    workTree: (
      <>
        <div
          onClick={() => setView("markdown")}
          onFocus={() => setActiveTab("agents")}
          onMouseOver={() => setActiveTab("agents")}
          onMouseLeave={() => setActiveTab(null)}
          className="cursor-zoom-in relative flex items-center gap-2 text-sm text-gray-700 px-4 py-1.5"
        >
          {activeTab === "agents" ? (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-page"
            />
          ) : null}
          <FileIcon className="z-10 relative size-4 text-gray-500" />
          <span className="z-10 relative font-bold text-xs text-gray-500">
            AGENTS.md
          </span>
        </div>
        <div
          onFocus={() => setActiveTab("claude")}
          onMouseOver={() => setActiveTab("claude")}
          onMouseLeave={() => setActiveTab(null)}
          className="cursor-zoom-in relative flex items-center gap-2 text-sm text-gray-700 px-4 py-1.5"
        >
          {activeTab === "claude" ? (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-page"
            />
          ) : null}
          <FileInputIcon className="z-10 relative size-4 text-gray-500" />
          <span className="z-10 relative font-bold text-xs text-gray-500">
            CLAUDE.md
          </span>
        </div>
        <div
          onClick={({ target }) => {
            if ((target as HTMLElement).closest("a")) return;
            setExpanded(!expanded);
          }}
          onMouseOver={() => setActiveTab("folder")}
          onMouseLeave={() => setActiveTab(null)}
          className="cursor-pointer relative flex items-center gap-2 text-sm text-gray-700 px-4 py-1.5"
        >
          {activeTab === "folder" ? (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-page"
            />
          ) : null}
          <ChevronIcon className="z-10 relative size-4 text-gray-500 rotate-90" />
          <FolderOpenIcon className="z-10 relative size-4 text-gray-500" />
          <span className="z-10 relative font-bold text-xs text-gray-500">
            GitHub
          </span>
          <a
            href="https://github.com/felipetodev"
            className="z-30 relative ml-auto"
            rel="noopener noreferrer"
            target="_blank"
          >
            <ArrowUpRightIcon className="size-4" />
          </a>
        </div>
        <motion.div animate={{ height: bounds.height || undefined }}>
          <div ref={ref}>
            {expanded ? (
              projects.map(({ id, name, description, url }) => (
                <div
                  key={id}
                  onFocus={() => setActiveTab(id)}
                  onMouseOver={() => setActiveTab(id)}
                  onMouseLeave={() => setActiveTab(null)}
                  className="cursor-crosshair ml-6 border-l border-gray-500/20 pl-6 pt-2 group"
                >
                  <div className="relative flex w-full items-center text-xs text-gray-500 px-4 py-1.5">
                    <FolderClosedIcon className="z-10 size-4" />
                    <span className="z-10 ml-2">{name}</span>
                    <span className="z-10 hidden md:inline mx-2">—</span>
                    <p className="z-10 hidden md:inline text-[10px]">
                      {description}
                    </p>
                    {activeTab === id ? (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute inset-0 bg-page"
                      >
                        <div className="flex size-full items-center justify-end px-4">
                          <a
                            href={url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            <ArrowUpRightIcon className="size-4" />
                          </a>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="ml-6 border-l border-gray-500/20 pl-6 pt-2">
                <p className="text-xs text-gray-500 italic">Click to expand</p>
              </div>
            )}
          </div>
        </motion.div>
      </>
    ),
  };

  return (
    <div className="grid gap-6">
      <h3 className="uppercase font-bold text-sm text-gray-700 tracking-wider">
        Explore featured works and experiments
      </h3>
      <div
        className={`relative bg-surface border border-black/40 overflow-hidden ${view === "markdown" ? "max-h-83.5" : "p-4"}`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={view}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="overflow-auto size-full relative"
          >
            {type[view]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Projects({ markdown }: { markdown: string }) {
  return (
    <section id="work" className="5️⃣ row-5 min-w-0 space-y-8 p-2 md:p-5">
      <h2 className="uppercase font-bold text-black/70 tracking-wider">
        01 / Projects
      </h2>
      <LatestProject />
      <ProjectWorkTree markdown={markdown} />
    </section>
  );
}
