import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const clashDisplay = localFont({
  src: '../public/fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash-display',
  display: 'swap',
  weight: '200 700',
})

export const metadata: Metadata = {
  title: {
    default: 'publica.now - Sell Your Content Your Way',
    template: '%s | publica.now'
  },
  description: 'Create, publish, and monetize your content with zero upfront costs. Keep 85% of your earnings when you accept subscriptions.',
  keywords: ['content creation', 'monetization', 'subscriptions', 'publishing', 'creator economy'],
  authors: [{ name: 'publica.la' }],
  creator: 'publica.la',
  publisher: 'publica.la',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://publica.now'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://publica.now',
    title: 'publica.now - Sell Your Content Your Way',
    description: 'Create, publish, and monetize your content with zero upfront costs. Keep 85% of your earnings when you accept subscriptions.',
    siteName: 'publica.now',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'publica.now - Content Monetization Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'publica.now - Sell Your Content Your Way',
    description: 'Create, publish, and monetize your content with zero upfront costs. Keep 85% of your earnings when you accept subscriptions.',
    images: ['/images/og-image.svg'],
    creator: '@publica_la',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${clashDisplay.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="publica.now" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-body bg-[#0a0a0a] text-[#FAFAFA] antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[10000] focus:bg-surface-1 focus:text-brand-400 focus:ring-2 focus:ring-brand-500 focus:outline-none px-4 py-2 rounded">
          Skip to main content
        </a>
        <AuthProvider>
          <SiteHeader />
          <main id="main" role="main">
            {children}
          </main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  )
}
