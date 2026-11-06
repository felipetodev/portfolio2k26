"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Doto } from "next/font/google";
import { SYSTEM_ALERT } from "@/utils/system-events";
import { readClock, serverClock, subscribeClock } from "@/utils/santiago-clock";

// Dot-matrix font for the LED display (self-hosted by next/font).
const doto = Doto({ subsets: ["latin"], weight: "900", display: "swap" });

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

const CRITICAL_MS = 8000;
const RED = "#ff3b30";
const AMBER = "#f5a623";
const ALERT_ITEMS = [
  "!! CRITICAL ERROR !!",
  "ROOT FILESYSTEM DELETED",
  "KERNEL PANIC",
  "REBOOTING IN 3.. 2.. 1..",
];

// LED ticker: move one dot column at a time, like a pixel sign.
const DOT = 5; // px between LEDs (matches the dot grid background)
const COLUMNS_PER_SECOND = 16;

// --- Boot sequence: a band of LEDs sweeps right → left, dot by dot ---
const BOOT_DOT = 8; // bigger LEDs for the boot effect
const BOOT_COLUMNS_PER_SECOND = 110;
const BOOT_TRAIL_SECONDS = 0.7; // how long a column takes to fade out
function LedBoot({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return onDone();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return onDone();
    }

    let raf = 0;
    const start = (startTime: number) => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      const cols = Math.round(width / BOOT_DOT);
      const rows = Math.max(1, Math.round(height / BOOT_DOT));
      const px = width / cols; // stretch the grid to fill the panel exactly
      const py = height / rows;
      const radius = Math.min(px, py) * 0.36;
      const total = cols / BOOT_COLUMNS_PER_SECOND + BOOT_TRAIL_SECONDS;
      // per-LED brightness noise, partially re-rolled to make it flicker
      const noise = Float32Array.from({ length: cols * rows }, Math.random);
      let lastFlicker = 0;

      const frame = (now: number) => {
        const t = (now - startTime) / 1000;
        if (now - lastFlicker > 70) {
          lastFlicker = now;
          for (let i = 0; i < noise.length; i++) if (Math.random() < 0.15) noise[i] = Math.random();
        }
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
        for (let c = 0; c < cols; c++) {
          // rightmost column lights up first, then fades with a noisy trail
          const age = t - (cols - 1 - c) / BOOT_COLUMNS_PER_SECOND;
          const fade = age < 0 ? 0 : Math.max(0, 1 - age / BOOT_TRAIL_SECONDS) ** 1.6;
          for (let r = 0; r < rows; r++) {
            const n = noise[c * rows + r];
            const v =
              age >= 0 && age < 0.08
                ? 0.85 + 0.15 * n // leading edge: almost all on
                : Math.max(0.08, fade * (0.3 + 0.7 * n)); // trail, never fully dark
            const g = Math.round(v * 255);
            ctx.fillStyle = `rgb(${g} ${g} ${g})`;
            ctx.beginPath();
            ctx.arc(c * px + px / 2, r * py + py / 2, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (t < total) raf = requestAnimationFrame(frame);
        else onDone();
      };
      raf = requestAnimationFrame(frame);
    };

    // play only once the monitor is on screen
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      start(performance.now());
    }, { threshold: 0.6 });
    io.observe(canvas);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />;
}

type Song = { playing: boolean; title: string; artist: string };

export function SystemMonitor({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribeClock, readClock, serverClock);
  const gpuName = useSyncExternalStore(noop, readGPU, () => null);
  const [boot, setBoot] = useState<number | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [critical, setCritical] = useState(false);
  const [booted, setBooted] = useState(false);
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

  // `sudo rm -rf` in the terminal → critical mode for a few seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onAlert = () => {
      setCritical(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCritical(false), CRITICAL_MS);
    };
    window.addEventListener(SYSTEM_ALERT, onAlert);
    return () => {
      window.removeEventListener(SYSTEM_ALERT, onAlert);
      clearTimeout(timer);
    };
  }, []);

  const onBooted = useCallback(() => setBooted(true), []);

  const liveItems = [
    `SCL ${time}`,
    boot !== null && `BOOT ${boot}MS`,
    gpuName && `GPU ${gpuName}`,
    song && `${song.playing ? "NOW PLAYING" : "LAST PLAYED"} ${song.title} - ${song.artist}`,
    "STATUS: SHIPPING",
  ].filter(Boolean) as string[];
  const items = critical ? ALERT_ITEMS : liveItems;
  const text = `${items.join("  ·  ")}  ·  `.toUpperCase();

  useEffect(() => {
    const el = tickerRef.current;
    if (!booted || !el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      // alerts start from the beginning so they read in full
      if (!critical) anim.currentTime = progress.current * (steps / COLUMNS_PER_SECOND) * 1000;
    });

    return () => {
      cancelled = true;
      if (anim) {
        const d = Number(anim.effect?.getTiming().duration) || 1;
        if (!critical) progress.current = ((Number(anim.currentTime) || 0) % d) / d;
        anim.cancel();
      }
    };
  }, [text, critical, booted]);

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
          <span
            role="status"
            className="flex items-center gap-2 text-gray-400"
            style={critical ? { color: RED } : undefined}
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none"
              style={critical ? { background: RED } : booted ? undefined : { background: AMBER }}
            />
            {critical ? "ERROR" : booted ? "LIVE" : "BOOTING"}
          </span>
        </div>

        {/* LED panel: a dim dot grid behind lit dot-matrix text */}
        <div
          className={`${doto.className} relative overflow-hidden rounded-md border border-black/40 bg-black py-2
            bg-[radial-gradient(circle,rgb(255_255_255/0.09)_1.2px,transparent_1.4px)] bg-size-[5px_5px]`}
          style={critical ? { borderColor: RED, boxShadow: `0 0 12px ${RED}66` } : undefined}
        >
          <p className="sr-only">{items.join(", ")}</p>
          {!booted && <LedBoot onDone={onBooted} />}
          <div
            ref={tickerRef}
            aria-hidden
            className={`${booted ? "" : "invisible"} flex w-max whitespace-pre text-2xl md:text-4xl leading-none text-white/90 [text-shadow:0_0_6px_rgb(255_255_255/0.45)]`}
            style={critical ? { color: RED, textShadow: `0 0 8px ${RED}` } : undefined}
          >
            <span>{text}</span>
            <span>{text}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
