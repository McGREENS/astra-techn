'use client'

import { useCallback, useEffect, useState } from 'react'
import { Copy, ExternalLink, LayoutDashboard, Package, Link2, Plus, Settings } from 'lucide-react'

import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { StatCard } from '@/components/dashboard/stat-card'
import { OrdersTable } from '@/components/dashboard/orders-table'
import { NewOrderForm } from '@/components/dashboard/new-order-form'
import { getSellerOrders, getSellerStats } from '@/lib/orders/actions'
import type { OrderWithItems, OrderStats } from '@/lib/orders/actions'
import { siteUrl, displayUrl } from '@/lib/site-url'
import type { NavItem } from '@/components/dashboard/sidebar'

const SELLER_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',          icon: LayoutDashboard, exact: true },
  { label: 'Products',   href: '/dashboard/products', icon: Package },
  { label: 'Order link', href: '/dashboard/link',     icon: Link2 },
  { label: 'Settings',   href: '/dashboard/settings', icon: Settings },
]

export default function DashboardPage() {
  const { user, loading } = useRequireRole('seller')
  const [orders, setOrders]   = useState<OrderWithItems[]>([])
  const [stats, setStats]     = useState<OrderStats | null>(null)
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied]   = useState(false)

  const load = useCallback(async (uid: string) => {
    setFetching(true)
    const [o, s] = await Promise.all([getSellerOrders(uid), getSellerStats(uid)])
    setOrders(o)
    setStats(s)
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load(user.id) }, [user, load])

  if (loading || !user || user.role !== 'seller') return <PageLoader />

  const orderLink    = user.slug ? displayUrl(`/s/${user.slug}`) : null
  const orderFullUrl = user.slug ? siteUrl(`/s/${user.slug}`) : null

  const copyLink = () => {
    if (!orderFullUrl) return
    navigator.clipboard.writeText(orderFullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOrderCancelled = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'cancelled' as const } : o)))
    if (stats) setStats({ ...stats, pending: Math.max(0, stats.pending - 1) })
  }

  return (
    <DashboardShell user={user} navItems={SELLER_NAV}>

      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Dashboard</h1>
        <p className="mt-0.5 text-sm text-[#8D8E91]">Welcome back, {user.name.split(' ')[0]}.</p>
      </div>

      {/* Order link banner */}
      {orderLink && (
        <div className="mb-6 flex flex-col gap-3 border border-[#E9E9EA] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">Your order link</p>
            <p className="mt-0.5 font-mono text-sm font-medium text-[#0B0B0D]">{orderLink}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink}
              className="inline-flex items-center gap-2 border border-[#E9E9EA] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-[#0B0B0D] hover:bg-[#F9F9FA] transition">
              <Copy size={13} /> {copied ? 'Copied' : 'Copy'}
            </button>
            <a href={orderFullUrl ?? '#'} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#E9E9EA] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-[#0B0B0D] hover:bg-[#F9F9FA] transition">
              <ExternalLink size={13} /> Open
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid gap-px bg-[#E9E9EA] sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders"      value={stats?.total     ?? '�'} />
        <StatCard label="Pending"           value={stats?.pending   ?? '�'} accent />
        <StatCard label="Active deliveries" value={stats?.active    ?? '�'} />
        <StatCard label="Delivered"         value={stats?.delivered ?? '�'} />
      </div>

      {/* Orders */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-widest text-[#8D8E91]">Orders</h2>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] transition">
          <Plus size={14} /> New order
        </button>
      </div>

      {fetching ? (
        <div className="border border-[#E9E9EA] bg-white p-10 text-center text-sm text-[#8D8E91]">
          Loading orders�
        </div>
      ) : (
        <OrdersTable orders={orders} onOrderCancelled={handleOrderCancelled} />
      )}

      {/* Store info strip */}
      {(user.businessName || user.category) && (
        <div className="mt-5 flex flex-wrap gap-6 border border-[#E9E9EA] bg-white p-5 text-sm">
          {user.businessName && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Store</p>
              <p className="mt-0.5 font-medium text-[#0B0B0D]">{user.businessName}</p>
            </div>
          )}
          {user.category && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Category</p>
              <p className="mt-0.5 font-medium text-[#0B0B0D]">{user.category}</p>
            </div>
          )}
          {user.pickupAddress && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Pickup address</p>
              <p className="mt-0.5 font-medium text-[#0B0B0D]">{user.pickupAddress}</p>
            </div>
          )}
          {(user.instagram || user.tiktok) && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Social</p>
              <p className="mt-0.5 font-medium text-[#0B0B0D]">
                {[user.instagram, user.tiktok].filter(Boolean).join(' � ')}
              </p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <NewOrderForm
          sellerId={user.id}
          onSuccess={() => { setShowForm(false); load(user.id) }}
          onClose={() => setShowForm(false)}
        />
      )}
    </DashboardShell>
  )
}

