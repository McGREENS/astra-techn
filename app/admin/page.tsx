'use client'

import { useEffect, useState } from 'react'

import { AppShell } from '@/components/auth/app-shell'
import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { getRiders, setRiderStatus, type MockUser, type RiderStatus } from '@/lib/mock-auth'
import { cn } from '@/lib/utils'

function StatusBadge({ status }: { status: RiderStatus }) {
  const map: Record<RiderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    suspended: 'bg-red-50 text-red-700',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize',
        map[status],
      )}
    >
      {status}
    </span>
  )
}

export default function AdminPage() {
  const { user, loading } = useRequireAdmin()
  const [riders, setRiders] = useState<MockUser[]>([])

  useEffect(() => {
    if (user) setRiders(getRiders())
  }, [user])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const update = (id: string, status: RiderStatus) => setRiders(setRiderStatus(id, status))
  const pendingCount = riders.filter((r) => r.riderStatus === 'pending').length

  return (
    <AppShell user={user} title="Admin">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold text-[#0A1F44]">Riders</h2>
        <span className="rounded-full bg-[#E8F3FF] px-2.5 py-1 text-xs font-bold text-[#2872A8]">
          {pendingCount} pending
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#CFE6FF] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[#CFE6FF] text-left text-xs font-bold uppercase tracking-wider text-[#48627F]">
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8F3FF]">
              {riders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[#48627F]">
                    No riders yet.
                  </td>
                </tr>
              )}
              {riders.map((r) => (
                <tr key={r.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[#0A1F44]">{r.name}</div>
                    <div className="text-xs text-[#48627F]">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#48627F]">{r.area ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.riderStatus ?? 'pending'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={r.riderStatus === 'approved'}
                        onClick={() => update(r.id, 'approved')}
                        className="rounded-lg bg-[#E8F3FF] px-3 py-1.5 text-xs font-bold text-[#2872A8] transition hover:bg-[#d4e8ff] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        disabled={r.riderStatus === 'suspended'}
                        onClick={() => update(r.id, 'suspended')}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-sm text-[#48627F]">
        Approve and Suspend update the rider&rsquo;s status instantly in the demo store.
      </p>
    </AppShell>
  )
}
