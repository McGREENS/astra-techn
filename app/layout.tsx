import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { AuthProvider } from '@/components/auth/auth-provider'
import './globals.css'

// Montserrat — the only typeface in the brand guide.
// We load Light (300), Regular (400), and Medium (500) — the three weights used.
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Astra Technologies — Delivery for social sellers',
  description: 'Turn every Instagram and TikTok post into a delivery-ready order with Astra.',
  openGraph: {
    title: 'Astra Technologies',
    description: 'The delivery layer for the social commerce era.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png',  sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0B0B0D',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
