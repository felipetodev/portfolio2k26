import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Felipe Ossandon",
    short_name: "felipeto.dev",
    description:
      "Software Engineer, Open Source Contributor, and AI Enthusiast.",
    start_url: "/",
    display: "standalone",
    background_color: "#e7e5e4",
    theme_color: "#e7e5e4",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
