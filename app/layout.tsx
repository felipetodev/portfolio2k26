import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import { siteThemeScript } from "@/utils/site-theme";

const SITE_URL = "https://www.felipetodev.com";
const TITLE = "Felipe Ossandon | Software Engineer";
const DESCRIPTION =
  "Felipe Ossandon - Software Engineer, Open Source Contributor, and Tech Enthusiast.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "felipeto.dev",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "felipeto.dev - software engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fe_ossandon",
    creator: "@fe_ossandon",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  themeColor: "#e7e5e4",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Felipe Ossandon",
  url: SITE_URL,
  jobTitle: "Software Engineer",
  description: DESCRIPTION,
  sameAs: [
    "https://github.com/felipetodev",
    "https://x.com/fe_ossandon",
    "https://www.linkedin.com/in/felipeossandon/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased bg-page font-mono"
      suppressHydrationWarning // data-theme is set before hydration
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteThemeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
