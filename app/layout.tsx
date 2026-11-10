import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Outfit, Lexend } from 'next/font/google'
import { AuthProvider } from '@/components/auth/auth-provider'
import './globals.css'

// Outfit — geometric sans-serif, used for headings / display text
const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

// Lexend — optimized for reading proficiency, used for body text
const lexend = Lexend({
  variable: '--font-lexend',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Astra Technologies — Delivery for social sellers',
  description: 'Turn every Instagram and TikTok post into a delivery-ready order with Astra.',
  generator: 'v0.app',
  openGraph: { title: 'Astra Technologies', description: 'The delivery layer for the social commerce era.', type: 'website' },
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
}
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#0A1F44' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${outfit.variable} ${lexend.variable}`}><body className="antialiased"><AuthProvider>{children}</AuthProvider>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
