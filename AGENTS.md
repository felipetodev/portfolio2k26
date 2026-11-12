# felipetodev Portfolio

This portfolio is a single-page application built with Next.js 16 App Router, React 19, Tailwind v4, `motion` for animation.

- **`app/page.tsx`** composes every section inside one CSS grid whose rows are explicitly numbered. A subgrid wraps the sections, so adding or reordering a section means updating the `row-N` classes and the `row-[1/N]` span together.
- **Sections** live in `components/` (`intro`, `projects`, `system-monitor`, `terminal`, `reach-me`, `footer`); static data (projects list, contact links, ASCII art) lives in `utils/`.

## What makes this portfolio special?

This portfolio has hidden elements that you can discover to learn more about me, my interests, and other personal details. The hidden elements are not immediately visible on the page, but they can be revealed by interacting with certain parts of the portfolio. The idea is have a fun and interactive experience for visitors, while also showcasing my skills and personality.
