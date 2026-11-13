import type { Metadata } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";
import { siteThemeScript } from "@/utils/site-theme";

export const metadata: Metadata = {
  title: "About | Felipe Ossandon",
  description: "Felipe Ossandon - Software Engineer, Open Source Contributor, and Tech Enthusiast.",
  openGraph: {
    title: "Felipe Ossandon",
    description: "Software Engineer, Open Source Contributor, and Tech Enthusiast.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
  },
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
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
