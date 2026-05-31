import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ProConnectSA — Find Trusted Service Providers Across South Africa',
    template: '%s | ProConnectSA',
  },
  description:
    'ProConnectSA is a directory of verified service providers across South Africa. Find verified locksmiths, couriers, home renovation specialists, and immigration consultants.',
  keywords: [
    'South Africa services', 'locksmith South Africa', 'parcel delivery SA',
    'home renovation Cape Town', 'immigration services South Africa',
    'ProConnectSA', 'verified service providers',
  ],
  authors: [{ name: 'ProConnectSA' }],
  creator: 'ProConnectSA',
  metadataBase: new URL('https://www.proconnectsa.co.za'),
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://www.proconnectsa.co.za',
    siteName: 'ProConnectSA',
    title: 'ProConnectSA — Find Trusted Service Providers Across South Africa',
    description:
      'Verified locksmiths, couriers, renovation specialists, and immigration consultants. One directory, multiple specialists.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'ProConnectSA — South African service provider directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProConnectSA — Verified South African Service Providers',
    description: 'Find verified locksmiths, couriers, home renovation specialists and immigration consultants.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col bg-cream antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
