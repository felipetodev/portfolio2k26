export const GITHUB_USERNAME = "felipetodev";

export const SITE_CONFIG = {
  name: "Felipe Ossandon",
  title: "Full-Stack Engineer",
  location: "Chile",
  bio: "Full-stack engineer focused on building things that run fast \u2014 fast frontends, efficient backends, and developer-first products that scale reliably.",
  extendedBio: `Currently at Globant, building the main booking platform for British Airways. Previously shipped banking systems, AI-powered dev tools with 700k+ installs, and design systems that moved the needle on conversion.`,
  socials: {
    github: "https://github.com/felipetodev",
    twitter: "https://x.com/fe_ossandon",
    linkedin: "https://linkedin.com/in/felipeossandon",
  },
} as const;

export const PINNED_REPOS = [
  "bloom-bar",
  "forever-chile",
  "entropy-unit",
] as const;

export const FEATURED_REPOS = [
  ...PINNED_REPOS,
  "log.js",
  "alternify",
  "gentleman-transcript",
  "colabot",
  "colab-ai",
  "wanderlust",
  "styledcn-ui",
] as const;

export const EXCLUDED_REPOS = [
  "felipetodev",
  "portfolio-2k24",
  "js-portfolio",
  "react-portfolio",
  "JavaScript-Just-4-Fun",
  "Amazon-Clone-Project",
  "my-first-blog",
  "FAOU-RRHH",
  "La-Granola-Nuts-and-Seeds",
  "DummyRokketApp",
  "flag-project",
  "GiffyApp",
  "yelpclone",
  "Ossom",
  "Devit",
  "vercel-ship-25-coding-agent",
  "flybot-euro-scanner",
  "depabot",
] as const;

export const OSS_CONTRIBUTIONS = [
  {
    repo: "shikijs/shiki",
    description: "fix(monaco): handle missing settings in textmate theme",
    url: "https://github.com/shikijs/shiki",
  },
  {
    repo: "langchain-ai/langchainjs",
    description: "fix: supabase vector store delete params",
    url: "https://github.com/langchain-ai/langchainjs",
  },
  {
    repo: "heroui-inc/heroui",
    description: "fix checkbox icon pseudo element",
    url: "https://github.com/heroui-inc/heroui",
  },
  {
    repo: "ngneat/falso",
    description: "feat: add new food from latam",
    url: "https://github.com/ngneat/falso",
  },
  {
    repo: "SUI-Components/sui-components",
    description: "fix(atom/card): add card demo improvements",
    url: "https://github.com/SUI-Components/sui-components",
  },
] as const;

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Astro: "#ff5a03",
  HTML: "#e34c26",
  CSS: "#563d7c",
};
