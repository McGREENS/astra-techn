'use client'

import { useCallback, useEffect, useState } from 'react'
import { XCircle } from 'lucide-react'

import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { AdminShell } from '@/components/admin/admin-shell'
import { getAllOrders, adminCancelOrder } from '@/lib/admin/actions'
import type { AdminOrder } from '@/lib/admin/actions'
import { cn } from '@/lib/utils'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'border-[#C9CACD] bg-[#F9F9FA] text-[#3A3D44]',
  assigned:  'border-blue-200 bg-blue-50 text-blue-700',
  picked_up: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  delivered: 'border-[#3A3D44] bg-[#0B0B0D] text-[#E9E9EA]',
  cancelled: 'border-[#E9E9EA] bg-white text-[#C9CACD]',
}

export default function AdminOrdersPage() {
  const { user, loading } = useRequireAdmin()
  const [orders,   setOrders]   = useState<AdminOrder[]>([])
  const [fetching, setFetching] = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')

  const load = useCallback(async () => {
    setFetching(true)
    setOrders(await getAllOrders())
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this order?')) return
    await adminCancelOrder(id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o))
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search && !o.customerName.toLowerCase().includes(search.toLowerCase()) &&
        !(o.sellerBusiness ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <AdminShell user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Orders</h1>
        <p className="mt-0.5 text-sm text-[#8D8E91]">All orders across the platform.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {['all','pending','assigned','picked_up','delivered','cancelled'].map(s => (
            <button key={s} type="button" onClick={() => setFilter(s)}
              className={cn('shrink-0 border px-3 py-1.5 text-xs font-medium capitalize transition',
                filter === s
                  ? 'border-[#0B0B0D] bg-[#0B0B0D] text-white'
                  : 'border-[#E9E9EA] bg-white text-[#8D8E91] hover:border-[#8D8E91]')}>
              {s === 'picked_up' ? 'Picked up' : s === 'all' ? `All (${orders.length})` : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <input type="search" placeholder="Search customer or store…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-[#E9E9EA] bg-white px-3 py-2 text-sm text-[#0B0B0D] outline-none focus:border-[#8D8E91] sm:w-64" />
      </div>

      {fetching ? (
        <div className="flex items-center gap-3 border border-[#E9E9EA] bg-white px-6 py-10 text-sm text-[#8D8E91]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#E9E9EA] border-t-[#0B0B0D]" />
          Loading orders…
        </div>
      ) : (
        <div className="overflow-hidden border border-[#E9E9EA] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[#E9E9EA] text-left text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Date</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E9EA]">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-[#8D8E91]">No orders match.</td></tr>
                )}
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-[#F9F9FA] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#C9CACD]">{o.id.slice(0,8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0B0B0D]">{o.customerName}</p>
                      <p className="text-xs text-[#8D8E91]">{o.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8D8E91]">{o.sellerBusiness ?? o.sellerName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center border px-2.5 py-1 text-xs font-medium', STATUS_STYLES[o.status] ?? '')}>
                        {o.status.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-[#0B0B0D]">{o.totalCents > 0 ? fmt(o.totalCents) : '—'}</td>
                    <td className="px-4 py-3 text-right text-xs text-[#C9CACD]">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {(o.status === 'pending' || o.status === 'assigned') && (
                        <button type="button" onClick={() => handleCancel(o.id)}
                          className="text-[#C9CACD] hover:text-red-500 transition" title="Cancel">
                          <XCircle size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
