import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Sora } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/context/QueryProvider'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const display = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['700','800'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ecove.com.ng'

export const metadata: Metadata = {
  title: {
    default: "Ecove – Nigeria's Online Marketplace | Shop Smart, Live Better",
    template: '%s | Ecove Marketplace',
  },
  description: 'Shop electronics, fashion, home appliances, phones, beauty products and more at the best prices in Nigeria. Fast delivery nationwide.',
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: APP_URL,
    siteName: 'Ecove Marketplace',
    title: "Ecove – Nigeria's Online Marketplace | Shop Smart, Live Better",
    description: 'Shop electronics, fashion, home appliances, phones, beauty products and more at the best prices in Nigeria. Fast delivery nationwide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Ecove – Nigeria's Online Marketplace",
    description: 'Shop electronics, fashion, home appliances, phones and more at the best prices in Nigeria.',
    site: '@ecoveng',
  },
  icons: {
    icon: '/images/ecove-logo.png',
    apple: '/images/ecove-logo.png',
    shortcut: '/images/ecove-logo.png',
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
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 4000,
              style: { fontFamily: 'var(--font-sans)', fontSize: '14px' },
              success: { iconTheme: { primary: '#f68b1f', secondary: '#fff' } },
              error: { iconTheme: { primary: '#e53935', secondary: '#fff' } },
            }}/>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
