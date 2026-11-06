"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Doto } from "next/font/google";

// Dot-matrix font for the LED display (self-hosted by next/font).
const doto = Doto({ subsets: ["latin"], weight: "900", display: "swap" });

// --- Santiago clock (useSyncExternalStore keeps SSR and client in sync) ---
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Santiago",
  hour: "2-digit",
  minute: "2-digit",
});
function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 10_000);
  return () => clearInterval(id);
}
const readClock = () => clock.format(new Date());

// --- Visitor GPU via WebGL (read once, stays in the browser) ---
let gpu: string | null | undefined;
function readGPU() {
  if (gpu !== undefined) return gpu;
  gpu = null;
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const raw = String(gl?.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "")
      .replace(/\s*\((R|TM)\)/gi, "");
    gl?.getExtension("WEBGL_lose_context")?.loseContext(); // free it right away
    // "ANGLE (Apple, ANGLE Metal Renderer: Apple M2 Pro, Unspecified Version)" → "Apple M2 Pro"
    const name = (raw.match(/Renderer: ([^,]+)/)?.[1] ?? raw.match(/ANGLE \([^,]+, ([^,]+)/)?.[1] ?? raw)
      .replace(/Direct3D.*|vs_\d.*|OpenGL.*/gi, "")
      .trim();
    gpu = name && !/^(webkit|mozilla)/i.test(name) ? name : null; // skip generic masks
  } catch {}
  return gpu;
}
const noop = () => () => {};

// LED ticker: move one dot column at a time, like a pixel sign.
const DOT = 5; // px between LEDs (matches the dot grid background)
const COLUMNS_PER_SECOND = 22;

type Song = { playing: boolean; title: string; artist: string };

export function SystemMonitor({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribeClock, readClock, () => "--:--");
  const gpuName = useSyncExternalStore(noop, readGPU, () => null);
  const [boot, setBoot] = useState<number | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0); // keep position when the text updates

  useEffect(() => {
    // time until the page became interactive
    const raf = requestAnimationFrame(() => setBoot(Math.round(performance.now())));

    const ctrl = new AbortController();
    fetch("/api/spotify", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: Song | null) => s && setSong(s))
      .catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      ctrl.abort();
    };
  }, []);

  const items = [
    `SCL ${time}`,
    boot !== null && `BOOT ${boot}MS`,
    gpuName && `GPU ${gpuName}`,
    song && `${song.playing ? "NOW PLAYING" : "LAST PLAYED"} ${song.title} - ${song.artist}`,
    "STATUS: SHIPPING",
  ].filter(Boolean) as string[];
  const text = `${items.join("  ·  ")}  ·  `.toUpperCase();

  useEffect(() => {
    const el = tickerRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let anim: Animation | undefined;
    let cancelled = false;

    // wait for the dot font so the measured width is right
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const distance = el.scrollWidth / 2; // one copy of the text
      const steps = Math.round(distance / DOT);
      anim = el.animate(
        [{ transform: "translateX(0)" }, { transform: `translateX(-${steps * DOT}px)` }],
        {
          duration: (steps / COLUMNS_PER_SECOND) * 1000,
          iterations: Infinity,
          easing: `steps(${steps})`,
        },
      );
      anim.currentTime = progress.current * (steps / COLUMNS_PER_SECOND) * 1000;
    });

    return () => {
      cancelled = true;
      if (anim) {
        const d = Number(anim.effect?.getTiming().duration) || 1;
        progress.current = ((Number(anim.currentTime) || 0) % d) / d;
        anim.cancel();
      }
    };
  }, [text]);

  return (
    <section
      aria-label="System monitor"
      className={`${className} relative min-w-0 p-2 md:p-5
        before:absolute before:w-[200vw] before:border-b before:border-gray-500/20 before:left-1/2 before:-translate-x-1/2 before:-bottom-px
        after:absolute after:w-[200vw] after:border-t after:border-gray-500/20 after:left-1/2 after:-translate-x-1/2 after:-top-px`}
    >
      <div className="border border-dashed border-gray-500/30 bg-[#f2f0ef] p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-bold tracking-[0.3em] text-gray-700">
          <h2>SYSTEM MONITOR</h2>
          <span className="flex items-center gap-2 text-gray-400">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none"
            />
            LIVE
          </span>
        </div>

        {/* LED panel: a dim dot grid behind lit dot-matrix text */}
        <div
          className={`${doto.className} relative overflow-hidden rounded-md border border-black/40 bg-black py-2
            bg-[radial-gradient(circle,rgb(255_255_255/0.09)_1.2px,transparent_1.4px)] bg-size-[5px_5px]`}
        >
          <p className="sr-only">{items.join(", ")}</p>
          <div
            ref={tickerRef}
            aria-hidden
            className="flex w-max whitespace-pre text-2xl md:text-4xl leading-none text-white/90 [text-shadow:0_0_6px_rgb(255_255_255/0.45)]"
          >
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
