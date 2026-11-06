"use client";
import { useEffect, useState } from "react";
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

function LatestProject() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="hidden md:flex flex-col col-span-2 md:col-auto gap-2 text-sm text-gray-700 justify-center md:border-y border-dashed border-gray-500/20">
        <h3 className="font-bold text-sm">latest side-project</h3>
        <p className="text-sm leading-relaxed">
          Unofficial CLI to manage your BICE bank account just vibing from your
          terminal.
        </p>
        <a
          href="#"
          className="mt-4 grid place-items-center text-xs text-gray-500"
        >
          <svg className="size-5" viewBox="0 0 1024 1024" fill="none">
            <path
              className="fill-black"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
              transform="scale(64)"
              fill="#ffff"
            />
          </svg>
          View on GitHub
        </a>
      </div>
      <div className="block col-span-2 border border-dashed border-gray-500/20 md:h-62 overflow-hidden">
        <video
          loop
          autoPlay
          src="/bice-cli.mp4"
          muted
          playsInline
          preload="metadata"
          className="h-auto w-full object-cover object-center"
        />
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
    <section id="work" className="5️⃣ row-5 space-y-8 p-2 md:p-5">
      <h2 className="uppercase font-bold text-black/70 tracking-wider">
        01 / Projects
      </h2>
      <LatestProject />
      <ProjectWorkTree markdown={markdown} />
    </section>
  );
}
