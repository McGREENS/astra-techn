'use client'

import { useCallback, useEffect, useState } from 'react'
import { Users } from 'lucide-react'

import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { AdminShell } from '@/components/admin/admin-shell'
import { getAllRiders, adminSetRiderStatus } from '@/lib/admin/actions'
import type { SafeUser } from '@/lib/auth/types'
import { cn } from '@/lib/utils'

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'border-[#C9CACD] bg-[#F9F9FA] text-[#3A3D44]',
  approved:  'border-[#3A3D44] bg-[#0B0B0D] text-[#E9E9EA]',
  suspended: 'border-red-200 bg-red-50 text-red-700',
}

export default function AdminRidersPage() {
  const { user, loading } = useRequireAdmin()
  const [riders,   setRiders]   = useState<SafeUser[]>([])
  const [fetching, setFetching] = useState(true)
  const [selected, setSelected] = useState<SafeUser | null>(null)
  const [filter,   setFilter]   = useState('all')

  const load = useCallback(async () => {
    setFetching(true)
    setRiders(await getAllRiders())
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const handleStatus = async (id: string, status: 'approved' | 'suspended' | 'pending') => {
    await adminSetRiderStatus(id, status)
    setRiders(prev => prev.map(r => r.id === id ? { ...r, riderStatus: status } : r))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, riderStatus: status } : null)
  }

  const filtered = riders.filter(r => filter === 'all' || (r.riderStatus ?? 'pending') === filter)

  return (
    <AdminShell user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Riders</h1>
        <p className="mt-0.5 text-sm text-[#8D8E91]">Review and manage rider accounts.</p>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-wrap gap-1">
            {['all','pending','approved','suspended'].map(s => (
              <button key={s} type="button" onClick={() => setFilter(s)}
                className={cn('border px-3 py-1.5 text-xs font-medium capitalize transition',
                  filter === s
                    ? 'border-[#0B0B0D] bg-[#0B0B0D] text-white'
                    : 'border-[#E9E9EA] bg-white text-[#8D8E91] hover:border-[#8D8E91]')}>
                {s === 'all'
                  ? `All (${riders.length})`
                  : `${s.charAt(0).toUpperCase()+s.slice(1)} (${riders.filter(r=>(r.riderStatus??'pending')===s).length})`}
              </button>
            ))}
          </div>

          {fetching ? (
            <div className="flex items-center gap-3 border border-[#E9E9EA] bg-white px-6 py-10 text-sm text-[#8D8E91]">
              <span className="size-4 animate-spin rounded-full border-2 border-[#E9E9EA] border-t-[#0B0B0D]" />
              Loading riders…
            </div>
          ) : (
            <div className="overflow-hidden border border-[#E9E9EA] bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E9E9EA] text-left text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                    <th className="px-4 py-3">Rider</th>
                    <th className="hidden px-4 py-3 md:table-cell">Area</th>
                    <th className="hidden px-4 py-3 md:table-cell">Plate</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E9EA]">
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-[#8D8E91]">No riders.</td></tr>
                  )}
                  {filtered.map(r => (
                    <tr key={r.id} onClick={() => setSelected(r)}
                      className={cn('cursor-pointer transition-colors',
                        selected?.id === r.id ? 'bg-[#F9F9FA]' : 'hover:bg-[#F9F9FA]')}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#0B0B0D]">{r.name}</p>
                        <p className="text-xs text-[#8D8E91]">{r.email}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[#8D8E91] md:table-cell">{r.area ?? '—'}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-[#8D8E91] md:table-cell">{r.plateNumber ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center border px-2.5 py-1 text-xs font-medium capitalize',
                          STATUS_STYLES[r.riderStatus ?? 'pending'] ?? '')}>
                          {r.riderStatus ?? 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button disabled={r.riderStatus === 'approved'}
                            onClick={e => { e.stopPropagation(); handleStatus(r.id, 'approved') }}
                            className="border border-[#E9E9EA] px-3 py-1.5 text-xs font-medium text-[#0B0B0D] hover:bg-[#0B0B0D] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition">
                            Approve
                          </button>
                          <button disabled={r.riderStatus === 'suspended'}
                            onClick={e => { e.stopPropagation(); handleStatus(r.id, 'suspended') }}
                            className="border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 transition">
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="hidden lg:flex w-72 shrink-0 flex-col border border-[#E9E9EA] bg-white">
            <div className="flex items-center justify-between border-b border-[#E9E9EA] px-5 py-4">
              <p className="font-medium text-[#0B0B0D]">Rider details</p>
              <button type="button" onClick={() => setSelected(null)}
                className="text-[#C9CACD] hover:text-[#0B0B0D] transition text-xl leading-none">×</button>
            </div>
            <div className="border-b border-[#E9E9EA] p-5 flex justify-center">
              {selected.photoDataUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={selected.photoDataUrl} alt={selected.name} className="size-24 object-cover ring-1 ring-[#E9E9EA]" />
                : <div className="grid size-24 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-[#C9CACD]"><Users size={28} /></div>
              }
            </div>
            <div className="flex flex-col divide-y divide-[#E9E9EA] text-sm flex-1 overflow-y-auto">
              {[
                ['Name',        selected.name],
                ['Email',       selected.email],
                ['Phone',       selected.phone ?? '—'],
                ['Area',        selected.area ?? '—'],
                ['National ID', selected.nationalId ?? '—'],
                ['Plate',       selected.plateNumber ?? '—'],
                ['Joined',      fmtDate(selected.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-2 px-5 py-3">
                  <span className="text-xs font-medium uppercase tracking-widest text-[#C9CACD] shrink-0">{label}</span>
                  <span className="text-right text-[#0B0B0D] break-all">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto border-t border-[#E9E9EA] p-4 flex gap-2">
              <button disabled={selected.riderStatus === 'approved'}
                onClick={() => handleStatus(selected.id, 'approved')}
                className="flex-1 border border-[#E9E9EA] py-2 text-xs font-medium text-[#0B0B0D] hover:bg-[#0B0B0D] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
                Approve
              </button>
              <button disabled={selected.riderStatus === 'suspended'}
                onClick={() => handleStatus(selected.id, 'suspended')}
                className="flex-1 border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition">
                Suspend
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
