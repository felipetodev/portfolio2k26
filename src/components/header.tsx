import { Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const socialLinks = [
  {
    href: SITE_CONFIG.socials.github,
    icon: Github,
    label: "GitHub",
  },
  {
    href: SITE_CONFIG.socials.twitter,
    icon: Twitter,
    label: "X / Twitter",
  },
  {
    href: SITE_CONFIG.socials.linkedin,
    icon: Linkedin,
    label: "LinkedIn",
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          ~/felipetodev
        </Link>
        <nav className="flex items-center gap-0.5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <link.icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
