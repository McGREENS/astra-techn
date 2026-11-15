'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bike, LayoutDashboard } from 'lucide-react'

import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { OrderStatusBadge } from '@/components/dashboard/order-status-badge'
import {
  getAvailableOrdersWithSeller,
  getRiderOrdersWithSeller,
  acceptOrder,
  advanceOrderStatus,
} from '@/lib/orders/actions'
import type { OrderWithSeller } from '@/lib/orders/actions'
import type { NavItem } from '@/components/dashboard/sidebar'
import { cn } from '@/lib/utils'

const RIDER_NAV: NavItem[] = [
  { label: 'Jobs',     href: '/rider', icon: LayoutDashboard, exact: true },
  { label: 'Deliveries', href: '/rider/deliveries', icon: Bike },
]

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function AvailableCard({
  order,
  riderId,
  onAccepted,
}: {
  order: OrderWithSeller
  riderId: string
  onAccepted: (id: string) => void
}) {
  const [loading, setLoading] = useState(false)

  const accept = async () => {
    setLoading(true)
    const res = await acceptOrder(order.id, riderId)
    setLoading(false)
    if (res.ok) onAccepted(order.id)
  }

  return (
    <div className=" border border-[#E9E9EA] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0B0B0D]">{order.customerName}</p>
          <p className="mt-0.5 text-sm text-[#8D8E91] truncate">{order.deliveryAddress}</p>
          {order.note && (
            <p className="mt-1 text-xs text-[#C9CACD] italic">{order.note}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-[#C9CACD]">{fmtDate(order.createdAt)}</span>
      </div>

      {/* Seller pickup address */}
      {order.sellerPickupAddress && (
        <div className="mt-3 flex items-start gap-2  bg-[#F9F9FA] px-3 py-2.5">
          <span className="mt-0.5 text-xs font-bold uppercase tracking-wider text-[#C9CACD]">Pickup</span>
          <p className="text-xs font-medium text-[#8D8E91] truncate">{order.sellerPickupAddress}</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <OrderStatusBadge status={order.status} />
        <button
          onClick={accept}
          disabled={loading}
          className="border border-[#0B0B0D] bg-[#0B0B0D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152f60] disabled:opacity-60 transition"
        >
          {loading ? 'Accepting…' : 'Accept job'}
        </button>
      </div>
    </div>
  )
}

function MyOrderCard({ order, onAdvanced }: { order: OrderWithSeller; onAdvanced: (id: string, to: 'picked_up' | 'delivered') => void }) {
  const [loading, setLoading] = useState(false)

  const nextStep: { label: string; to: 'picked_up' | 'delivered' } | null =
    order.status === 'assigned'  ? { label: 'Mark as picked up', to: 'picked_up' } :
    order.status === 'picked_up' ? { label: 'Mark as delivered', to: 'delivered' } :
    null

  const advance = async () => {
    if (!nextStep || !order.riderId) return
    setLoading(true)
    const res = await advanceOrderStatus(order.id, order.riderId, nextStep.to)
    setLoading(false)
    if (res.ok) onAdvanced(order.id, nextStep.to)
  }

  return (
    <div className=" border border-[#E9E9EA] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0B0B0D]">{order.customerName}</p>
          <p className="mt-0.5 text-sm text-[#8D8E91] truncate">{order.deliveryAddress}</p>
          {order.note && (
            <p className="mt-1 text-xs text-[#C9CACD] italic">{order.note}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-[#C9CACD]">{fmtDate(order.createdAt)}</span>
      </div>

      {/* Pickup address (shown until picked up) */}
      {order.sellerPickupAddress && order.status === 'assigned' && (
        <div className="mt-3 flex items-start gap-2  bg-[#F9F9FA] px-3 py-2.5">
          <span className="mt-0.5 shrink-0 text-xs font-bold uppercase tracking-wider text-[#C9CACD]">Pickup</span>
          <p className="text-xs font-medium text-[#8D8E91] truncate">{order.sellerPickupAddress}</p>
        </div>
      )}

      {/* Customer phone — tap to call */}
      <a
        href={`tel:${order.customerPhone}`}
        className="mt-3 flex items-center gap-2  border border-[#E9E9EA] px-3 py-2.5 text-sm font-semibold text-[#0B0B0D] hover:bg-[#F9F9FA] transition"
      >
        <span className="text-[#0B0B0D]">📞</span>
        {order.customerPhone}
      </a>

      <div className="mt-4 flex items-center justify-between gap-3">
        <OrderStatusBadge status={order.status} />
        {nextStep && (
          <button
            onClick={advance}
            disabled={loading}
            className="border border-[#0B0B0D] bg-[#0B0B0D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3A3D44] disabled:opacity-60 transition"
          >
            {loading ? '…' : nextStep.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default function RiderPage() {
  const { user, loading } = useRequireRole('rider')

  const [available, setAvailable] = useState<OrderWithSeller[]>([])
  const [mine, setMine]           = useState<OrderWithSeller[]>([])
  const [fetching, setFetching]   = useState(true)
  const [tab, setTab]             = useState<'available' | 'mine'>('available')

  const load = useCallback(async (uid: string) => {
    setFetching(true)
    const [av, my] = await Promise.all([
      getAvailableOrdersWithSeller(),
      getRiderOrdersWithSeller(uid),
    ])
    setAvailable(av)
    setMine(my)
    setFetching(false)
  }, [])

  useEffect(() => {
    if (user) load(user.id)
  }, [user, load])

  if (loading || !user || user.role !== 'rider') return <PageLoader />

  const status = user.riderStatus ?? 'pending'

  const handleAccepted = (orderId: string) => {
    const order = available.find((o) => o.id === orderId)
    if (!order) return
    setAvailable((prev) => prev.filter((o) => o.id !== orderId))
    setMine((prev) => [
      { ...order, riderId: user.id, status: 'assigned' as const },
      ...prev,
    ])
    setTab('mine')
  }

  const handleAdvanced = (orderId: string, to: 'picked_up' | 'delivered') => {
    setMine((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: to } : o)))
  }

  return (
    <DashboardShell user={user} navItems={RIDER_NAV}>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0B0D]">Rider dashboard</h1>
        <p className="mt-0.5 text-sm text-[#8D8E91]">Welcome back, {user.name.split(' ')[0]}.</p>
      </div>

      {/* Status bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3  border border-[#E9E9EA] bg-white p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#C9CACD]">Account status</p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize',
                status === 'approved'  ? 'bg-emerald-50 text-emerald-700' :
                status === 'suspended' ? 'bg-red-50 text-red-700' :
                                         'bg-amber-50 text-amber-700',
              )}
            >
              {status}
            </span>
            {status === 'pending' && (
              <span className="text-xs text-[#8D8E91]">— You can accept jobs after approval.</span>
            )}
          </div>
        </div>
        {user.area && (
          <div className="ml-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C9CACD]">Area</p>
            <p className="mt-0.5 font-semibold text-[#0B0B0D]">{user.area}</p>
          </div>
        )}
      </div>

      {status !== 'approved' ? (
        <div className=" border border-dashed border-[#E9E9EA] bg-white px-6 py-12 text-center">
          <p className="text-sm font-semibold text-[#0B0B0D]">
            {status === 'suspended' ? 'Your account is suspended.' : 'Your profile is under review.'}
          </p>
          <p className="mt-1 text-sm text-[#8D8E91]">
            {status === 'suspended'
              ? 'Contact support to resolve this.'
              : 'Delivery jobs will appear here once you&rsquo;re approved.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="mb-4 flex gap-1  border border-[#E9E9EA] bg-white p-1 w-fit">
            {(['available', 'mine'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition capitalize',
                  tab === t
                    ? 'bg-[#0B0B0D] text-white'
                    : 'text-[#8D8E91] hover:bg-[#F9F9FA]',
                )}
              >
                {t === 'available' ? `Available (${available.length})` : `My jobs (${mine.length})`}
              </button>
            ))}
          </div>

          {fetching ? (
            <div className=" border border-[#E9E9EA] bg-white p-10 text-center text-sm text-[#8D8E91]">
              Loading jobs…
            </div>
          ) : tab === 'available' ? (
            available.length === 0 ? (
              <div className=" border border-dashed border-[#E9E9EA] bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#0B0B0D]">No available jobs right now</p>
                <p className="mt-1 text-sm text-[#8D8E91]">Check back shortly — orders appear here as sellers place them.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {available.map((o) => (
                  <AvailableCard key={o.id} order={o} riderId={user.id} onAccepted={handleAccepted} />
                ))}
              </div>
            )
          ) : mine.length === 0 ? (
            <div className=" border border-dashed border-[#E9E9EA] bg-white px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#0B0B0D]">No jobs yet</p>
              <p className="mt-1 text-sm text-[#8D8E91]">Accept a job from the available list to get started.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {mine.map((o) => (
                <MyOrderCard key={o.id} order={o} onAdvanced={handleAdvanced} />
              ))}
            </div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
