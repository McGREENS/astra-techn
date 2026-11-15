'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Download, ExternalLink, LayoutDashboard, Link2, MessageCircle, Settings, Share2 } from 'lucide-react'

import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { NavItem } from '@/components/dashboard/sidebar'

const SELLER_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',          icon: LayoutDashboard, exact: true },
  { label: 'Order link', href: '/dashboard/link',     icon: Link2 },
  { label: 'Settings',   href: '/dashboard/settings', icon: Settings },
]

function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }
  return { copied, copy }
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#E9E9EA] bg-white">
      <div className="border-b border-[#E9E9EA] px-6 py-4">
        <p className="font-medium text-[#0B0B0D]">{title}</p>
        {desc && <p className="mt-0.5 text-xs text-[#8D8E91]">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function UrlRow({ url, copied, onCopy, primary }: { url: string; copied: boolean; onCopy: () => void; primary?: boolean }) {
  return (
    <div className="flex items-center gap-3 border border-[#E9E9EA] bg-[#F9F9FA] px-4 py-3">
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-[#0B0B0D]">{url}</span>
      <button
        onClick={onCopy}
        className={`shrink-0 inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition ${
          primary
            ? 'border-[#0B0B0D] bg-[#0B0B0D] text-white hover:bg-[#3A3D44]'
            : 'border-[#E9E9EA] bg-white text-[#0B0B0D] hover:bg-[#F9F9FA]'
        }`}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

export default function OrderLinkPage() {
  const { user, loading } = useRequireRole('seller')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fullUrl    = user?.slug ? `https://astra.com/s/${user.slug}` : ''
  const displayUrl = user?.slug ? `astra.com/s/${user.slug}` : ''

  const { copied: copiedLink, copy: copyLink } = useCopy(fullUrl)
  const { copied: copiedSlug, copy: copySlug } = useCopy(user?.slug ?? '')

  useEffect(() => {
    if (!fullUrl) return
    QRCode.toDataURL(fullUrl, {
      width: 400, margin: 2,
      color: { dark: '#0B0B0D', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setQrDataUrl)
  }, [fullUrl])

  if (loading || !user || user.role !== 'seller') return <PageLoader />

  if (!user.slug) {
    return (
      <DashboardShell user={user} navItems={SELLER_NAV}>
        <div className="mb-6">
          <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Order link</h1>
        </div>
        <div className="border border-dashed border-[#E9E9EA] bg-white px-6 py-16 text-center">
          <p className="font-medium text-[#0B0B0D]">Your store isn&rsquo;t set up yet</p>
          <p className="mt-1 text-sm text-[#8D8E91]">Complete your store settings to get your order link.</p>
          <a href="/dashboard/settings" className="mt-4 inline-flex items-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3A3D44] transition">
            Go to settings
          </a>
        </div>
      </DashboardShell>
    )
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Order from ${user.businessName ?? 'my store'} here: ${fullUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const shareNative = async () => {
    if (!navigator.share) { copyLink(); return }
    try { await navigator.share({ title: user.businessName ?? 'My Astra store', url: fullUrl }) } catch {}
  }

  const downloadQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${user.slug}-qr.png`
    a.click()
  }

  return (
    <DashboardShell user={user} navItems={SELLER_NAV}>
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Order link</h1>
        <p className="mt-1 text-sm text-[#8D8E91]">Share this link with customers so they can place delivery orders directly.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5">

          <Card title="Your order link" desc="Send this to customers — they fill in their details and you get the order.">
            <div className="px-6 py-5 flex flex-col gap-4">
              <UrlRow url={displayUrl} copied={copiedLink} onCopy={copyLink} primary />
              <div className="flex flex-wrap gap-2">
                <a href={fullUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-[#E9E9EA] px-4 py-2.5 text-sm text-[#0B0B0D] hover:bg-[#F9F9FA] transition">
                  <ExternalLink size={14} /> Preview
                </a>
                <button onClick={shareWhatsApp}
                  className="inline-flex items-center gap-2 border border-[#E9E9EA] px-4 py-2.5 text-sm text-[#0B0B0D] hover:bg-[#F9F9FA] transition">
                  <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp
                </button>
                <button onClick={shareNative}
                  className="inline-flex items-center gap-2 border border-[#E9E9EA] px-4 py-2.5 text-sm text-[#0B0B0D] hover:bg-[#F9F9FA] transition">
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </Card>

          <Card title="Instagram & TikTok bio" desc="Instagram and TikTok don't allow links in captions — put it in your bio.">
            <div className="px-6 py-5 flex flex-col gap-3">
              <UrlRow url={displayUrl} copied={copiedLink} onCopy={copyLink} />
              <p className="text-xs text-[#8D8E91] leading-relaxed">
                1. Copy the link.&ensp;2. Open your profile.&ensp;3. Tap <strong className="text-[#0B0B0D]">Edit profile</strong> → paste in <strong className="text-[#0B0B0D]">Link in bio</strong>.
              </p>
            </div>
          </Card>

          <Card title="Your store slug" desc="Updates automatically when you change your business name in settings.">
            <div className="px-6 py-5">
              <UrlRow url={user.slug!} copied={copiedSlug} onCopy={copySlug} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="QR code" desc="Print or display this for in-person customers to scan.">
            <div className="flex flex-col items-center gap-5 px-5 py-6">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR code" className="w-full max-w-[200px] border border-[#E9E9EA] p-2" />
              ) : (
                <div className="flex h-[200px] w-full max-w-[200px] items-center justify-center border border-[#E9E9EA] bg-[#F9F9FA]">
                  <p className="text-xs text-[#C9CACD]">Generating…</p>
                </div>
              )}
              <button onClick={downloadQr} disabled={!qrDataUrl}
                className="inline-flex w-full items-center justify-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] disabled:opacity-50 transition">
                <Download size={14} /> Download PNG
              </button>
              <p className="text-center text-xs text-[#C9CACD]">High-resolution — safe to print large.</p>
            </div>
          </Card>

          <div className="border border-[#E9E9EA] bg-[#F9F9FA] px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Pro tip</p>
            <p className="mt-1.5 text-sm text-[#8D8E91] leading-relaxed">
              Print the QR code and stick it on your packaging or receipts — customers can reorder in seconds.
            </p>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </DashboardShell>
  )
}
