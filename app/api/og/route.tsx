import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const WIDTH = 1200;
const HEIGHT = 630;

// Same tokens as the site's default (stone) theme.
const PAGE = "#e7e5e4";
const SURFACE = "#f2f0ef";
const INK = "#171717";
const OUTER = "rgba(0,0,0,0.3)";
const INNER = "rgba(107,114,128,0.28)";
const MUTED = "#78716c";

// Fonts live next to the route; next.config.ts (outputFileTracingIncludes)
// makes sure they ship with the serverless function.
const font = (file: string) =>
  readFile(path.join(process.cwd(), "app/api/og/fonts", file));

function HLine({ y, color, solid }: { y: number; color: string; solid?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: y,
        width: WIDTH,
        height: 0,
        borderTopWidth: solid ? 1 : 1.5,
        borderTopStyle: solid ? "solid" : "dashed",
        borderTopColor: color,
      }}
    />
  );
}

function VLine({ x, color, solid }: { x: number; color: string; solid?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: x,
        height: HEIGHT,
        width: 0,
        borderLeftWidth: solid ? 1 : 1.5,
        borderLeftStyle: solid ? "solid" : "dashed",
        borderLeftColor: color,
      }}
    />
  );
}

/** Small "+" registration mark centered on (x, y). */
function Cross({ x, y }: { x: number; y: number }) {
  const size = 14;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, display: "flex" }}>
      <div style={{ position: "absolute", left: size / 2 - 0.75, top: 0, width: 1.5, height: size, background: INK }} />
      <div style={{ position: "absolute", top: size / 2 - 0.75, left: 0, height: 1.5, width: size, background: INK }} />
    </div>
  );
}

export async function GET() {
  const [regular, medium] = await Promise.all([font("plex-400.woff"), font("plex-500.woff")]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: PAGE, fontFamily: "Plex", color: INK }}>
        {/* center column surface */}
        <div style={{ position: "absolute", left: 200, top: 0, width: 800, height: HEIGHT, background: SURFACE }} />

        <VLine x={100} color={OUTER} />
        <VLine x={1100} color={OUTER} />
        <VLine x={200} color={INNER} solid />
        <VLine x={1000} color={INNER} solid />
        <HLine y={72} color={OUTER} />
        <HLine y={118} color={INNER} solid />
        <HLine y={134} color={INNER} solid />
        <HLine y={496} color={INNER} solid />
        <HLine y={512} color={INNER} solid />
        <HLine y={558} color={OUTER} />

        {[200, 1000].flatMap((x) => [72, 558].map((y) => <Cross key={`${x}-${y}`} x={x} y={y} />))}

        {/* hero */}
        <div style={{ position: "absolute", left: 200, top: 134, width: 800, height: 362, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 500, letterSpacing: -5, lineHeight: 1 }}>felipeto.dev</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 30, fontSize: 28, gap: 14 }}>
            <span style={{ color: MUTED }}>{">"}</span>
            <span>software engineer</span>
            <div style={{ width: 13, height: 28, background: INK }} />
          </div>
        </div>

        {/* bottom band */}
        <div style={{ position: "absolute", left: 216, top: 524, width: 768, display: "flex", justifyContent: "space-between", fontSize: 16, color: MUTED }}>
          <span>engineering · ai · product</span>
          <span>santiago, cl</span>
        </div>

        {/* gutter coordinates */}
        <div style={{ position: "absolute", left: 112, top: 300, fontSize: 13, color: MUTED, display: "flex" }}>-33.45°</div>
        <div style={{ position: "absolute", left: 1012, top: 300, fontSize: 13, color: MUTED, display: "flex" }}>-70.66°</div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Plex", data: regular, weight: 400, style: "normal" },
        { name: "Plex", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
