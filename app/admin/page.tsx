'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { AdminShell } from '@/components/admin/admin-shell'
import { BarChart } from '@/components/admin/bar-chart'
import { getPlatformStats, getOrdersPerDay } from '@/lib/admin/actions'
import type { PlatformStats, DailyCount } from '@/lib/admin/actions'
import { cn } from '@/lib/utils'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function shortDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
}

function StatTile({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className="border border-[#E9E9EA] bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">{label}</p>
      <p className={cn('mt-2 text-3xl font-light tracking-tight',
        accent ? 'text-[#3A3D44]' : 'text-[#0B0B0D]')}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-[#C9CACD]">{sub}</p>}
    </div>
  )
}

export default function AdminOverviewPage() {
  const { user, loading } = useRequireAdmin()
  const [stats,   setStats]   = useState<PlatformStats | null>(null)
  const [chart,   setChart]   = useState<DailyCount[]>([])
  const [fetching, setFetching] = useState(true)

  const load = useCallback(async () => {
    setFetching(true)
    const [s, c] = await Promise.all([getPlatformStats(), getOrdersPerDay(7)])
    setStats(s); setChart(c)
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const chartData = chart.map(d => ({ label: shortDay(d.date), value: d.count }))

  return (
    <AdminShell user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Overview</h1>
        <p className="mt-0.5 text-sm text-[#8D8E91]">Platform performance at a glance.</p>
      </div>

      {fetching || !stats ? (
        <div className="flex items-center gap-3 border border-[#E9E9EA] bg-white px-6 py-10 text-sm text-[#8D8E91]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#E9E9EA] border-t-[#0B0B0D]" />
          Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Revenue */}
          <div className="border border-[#E9E9EA] bg-[#0B0B0D] px-6 py-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
              Total platform revenue
            </p>
            <p className="mt-2 text-4xl font-light text-white">{fmt(stats.revenue)}</p>
            <p className="mt-1 text-xs text-[#3A3D44]">From delivered orders</p>
          </div>

          {/* Order stats */}
          <div className="grid gap-px bg-[#E9E9EA] sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Total orders"    value={stats.orders.total}     />
            <StatTile label="Delivered"       value={stats.orders.delivered} accent />
            <StatTile label="Active"          value={stats.orders.active}    />
            <StatTile label="Pending"         value={stats.orders.pending}   />
          </div>

          {/* Chart */}
          <div className="border border-[#E9E9EA] bg-white">
            <div className="border-b border-[#E9E9EA] px-5 py-4">
              <p className="font-medium text-[#0B0B0D]">Orders — last 7 days</p>
            </div>
            <div className="px-5 py-5">
              {chartData.every(d => d.value === 0)
                ? <p className="py-8 text-center text-sm text-[#C9CACD]">No orders yet</p>
                : <BarChart data={chartData} height={120} color="#0B0B0D" />
              }
            </div>
          </div>

          {/* User stats */}
          <div className="grid gap-px bg-[#E9E9EA] sm:grid-cols-3">
            <StatTile label="Sellers"
              value={stats.users.sellers} sub="Registered stores" />
            <StatTile label="Active riders"
              value={stats.users.ridersApproved}
              sub={`${stats.users.ridersPending} pending approval`} />
            <StatTile label="Suspended riders"
              value={stats.users.ridersSuspended} sub="Removed from platform" />
          </div>
        </div>
      )}
    </AdminShell>
  )
}
