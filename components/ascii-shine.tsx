"use client";
import { useEffect, useRef } from "react";

const RAMP = " .+*#%@";
const TICK_MS = 80;
const SPARKLE_RATE = 0.02; // share of glyphs twinkling per tick
const SPARKLE_LIFE = 4; // ticks before a glyph snaps back to its base char

// Renders the ASCII statically (SSR) and, on the client, makes random glyphs
// twinkle to a nearby density char, then restore. The shape never changes.
export function AsciiShine({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const base = [...text];
    const chars = [...base];
    const lit = base.flatMap((c, i) => (RAMP.indexOf(c) > 1 ? [i] : [])); // skip spaces and dots
    const live = new Map<number, number>(); // index -> remaining ticks
    let timer: ReturnType<typeof setInterval> | undefined;

    const tick = () => {
      for (const [i, left] of live) {
        if (left <= 1) {
          chars[i] = base[i];
          live.delete(i);
        } else live.set(i, left - 1);
      }
      const n = Math.ceil(lit.length * SPARKLE_RATE);
      for (let k = 0; k < n; k++) {
        const i = lit[(Math.random() * lit.length) | 0];
        const level = RAMP.indexOf(base[i]);
        const next = Math.min(RAMP.length - 1, Math.max(2, level + ((Math.random() * 5) | 0) - 2));
        chars[i] = RAMP[next];
        live.set(i, 1 + ((Math.random() * SPARKLE_LIFE) | 0));
      }
      el.textContent = chars.join("");
    };

    // animate only while on screen
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(tick, TICK_MS);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [text]);

  return (
    <pre ref={ref} aria-hidden="true" className={className}>
      {text}
    </pre>
  );
}
