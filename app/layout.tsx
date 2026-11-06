import type { Metadata } from "next";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "About | Felipe Ossandon",
  description: "Felipe Ossandon - Software Engineer, Open Source Contributor, and Tech Enthusiast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased bg-[#E7E5E4] font-mono"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
