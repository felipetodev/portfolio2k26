import { LocalTime } from "./local-time";
import { contact } from "@/utils/constants";

const navLink =
  "hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const nav = [
  // { label: "Work", href: "#work" },
  // { label: "About", href: "#about" },
  { label: "GitHub", href: contact.github, external: true },
  { label: "X", href: contact.x, external: true },
  { label: "LinkedIn", href: contact.linkedin, external: true },
  { label: "Email", href: `mailto:${contact.email}` },
] as const;

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`${className} min-w-0 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 p-2 md:p-5 text-sm text-gray-700`}
    >
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {nav.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={navLink}
                {...("external" in item
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <LocalTime />
    </footer>
  );
}
