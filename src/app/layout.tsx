import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const SITE_URL = 'https://felipetodev.com'

export const viewport: Viewport = {
  themeColor: '#0a0b10',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Felipe Ossandon - Full-Stack Engineer',
  description:
    'Full-stack engineer focused on building fast frontends, efficient backends, and developer-first products that scale reliably. Based in Chile.',
  keywords: [
    'full-stack engineer',
    'software developer',
    'React',
    'Next.js',
    'TypeScript',
    'Chile',
    'frontend',
    'backend',
  ],
  authors: [{ name: 'Felipe Ossandon', url: SITE_URL }],
  creator: 'Felipe Ossandon',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'Felipe Ossandon - Full-Stack Engineer',
    description:
      'Full-stack engineer focused on building fast frontends, efficient backends, and developer-first products.',
    url: SITE_URL,
    siteName: 'Felipe Ossandon',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og_image.png',
        width: 1376,
        height: 768,
        alt: 'Felipe Ossandon - Full-Stack Engineer',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@fe_ossandon',
    title: 'Felipe Ossandon - Full-Stack Engineer',
    description:
      'Full-stack engineer focused on building fast frontends, efficient backends, and developer-first products.',
    images: ['/og_image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Felipe Ossandon',
  url: SITE_URL,
  jobTitle: 'Full-Stack Engineer',
  worksFor: {
    '@type': 'Organization',
    name: 'Globant',
  },
  sameAs: [
    'https://github.com/felipetodev',
    'https://x.com/fe_ossandon',
    'https://linkedin.com/in/felipeossandon',
  ],
}

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
