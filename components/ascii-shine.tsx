"use client";
import { useEffect, useRef } from "react";

const RAMP = " .+*#%@";
const FRAME_MS = 33; // ~30fps is plenty for text
const PERIOD_MS = 4200; // sweep + rest
const SWEEP_MS = 1500;
const START_DELAY_MS = 400;
const BAND = 7; // band half-width, in columns
const SKEW = 0.9; // diagonal lean: how many cols a row shifts the band
const LIFT = 4; // max levels a glyph is bleached at the band's centre

const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

// Renders the ASCII statically (SSR) and, on the client, sweeps a diagonal
// glint across it: glyphs thin to lighter chars as the band passes, then rest
// until the next pass. The shape never changes.
export function AsciiShine({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const base = [...text];
    const chars = [...base];
    const glyphs: { i: number; col: number; row: number; level: number }[] = [];
    let col = 0;
    let row = 0;
    let cols = 0;
    base.forEach((c, i) => {
      if (c === "\n") {
        cols = Math.max(cols, col);
        col = 0;
        row++;
        return;
      }
      const level = RAMP.indexOf(c);
      if (level > 1) glyphs.push({ i, col, row, level }); // skip spaces and dots
      col++;
    });
    cols = Math.max(cols, col);
    const span = cols + (row + 1) * SKEW + BAND * 4;

    let t0 = 0;
    let last = 0;
    let dirty = false;
    let raf = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      if (!t0) t0 = now + START_DELAY_MS;

      const t = (now - t0) % PERIOD_MS;
      if (now < t0 || t > SWEEP_MS) {
        // resting: restore once, then do no work
        if (!dirty) return;
        for (const g of glyphs) chars[g.i] = base[g.i];
        dirty = false;
      } else {
        const centre = -BAND * 2 + easeInOut(t / SWEEP_MS) * span;
        for (const g of glyphs) {
          const d = g.col + g.row * SKEW - centre;
          const w = d > 0 ? BAND * 0.45 : BAND; // sharp leading edge, soft tail
          const lift = Math.round(Math.exp(-((d / w) ** 2)) * LIFT);
          chars[g.i] = RAMP[Math.max(1, g.level - lift)];
        }
        dirty = true;
      }
      el.textContent = chars.join("");
    };

    // animate only while on screen
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <pre ref={ref} aria-hidden="true" className={className}>
      {text}
    </pre>
  );
}
