'use client'

import { useCallback, useEffect, useState } from 'react'

import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { AdminShell } from '@/components/admin/admin-shell'
import { getAllSellers } from '@/lib/admin/actions'
import type { AdminSeller } from '@/lib/admin/actions'

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminSellersPage() {
  const { user, loading } = useRequireAdmin()
  const [sellers,  setSellers]  = useState<AdminSeller[]>([])
  const [fetching, setFetching] = useState(true)

  const load = useCallback(async () => {
    setFetching(true)
    setSellers(await getAllSellers())
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  return (
    <AdminShell user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Sellers</h1>
        <p className="mt-0.5 text-sm text-[#8D8E91]">{sellers.length} registered seller{sellers.length !== 1 ? 's' : ''}.</p>
      </div>

      {fetching ? (
        <div className="flex items-center gap-3 border border-[#E9E9EA] bg-white px-6 py-10 text-sm text-[#8D8E91]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#E9E9EA] border-t-[#0B0B0D]" />
          Loading sellers…
        </div>
      ) : (
        <div className="overflow-hidden border border-[#E9E9EA] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#E9E9EA] text-left text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="hidden px-4 py-3 md:table-cell">Category</th>
                  <th className="hidden px-4 py-3 md:table-cell">Order link</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E9EA]">
                {sellers.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#8D8E91]">No sellers yet.</td></tr>
                )}
                {sellers.map(s => (
                  <tr key={s.id} className="hover:bg-[#F9F9FA] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0B0B0D]">{s.businessName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-[#0B0B0D]">{s.name}</p>
                      <p className="text-xs text-[#8D8E91]">{s.email}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#8D8E91] md:table-cell">{s.category ?? '—'}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {s.slug
                        ? <a href={`/s/${s.slug}`} target="_blank" rel="noopener noreferrer"
                            className="font-mono text-xs text-[#8D8E91] hover:text-[#0B0B0D] transition">/s/{s.slug}</a>
                        : <span className="text-xs text-[#C9CACD]">Not set up</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-[#0B0B0D]">{s.orderCount}</td>
                    <td className="px-4 py-3 text-right text-xs text-[#C9CACD]">{fmtDate(s.createdAt)}</td>
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
