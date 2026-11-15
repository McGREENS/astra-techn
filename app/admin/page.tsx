'use client'

import { useEffect, useState } from 'react'

import { AppShell } from '@/components/auth/app-shell'
import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { getRiders, setRiderStatus } from '@/lib/auth/actions'
import type { RiderStatus, SafeUser } from '@/lib/auth/types'
import { cn } from '@/lib/utils'

function StatusBadge({ status }: { status: RiderStatus }) {
  const map: Record<RiderStatus, string> = {
    pending:   'border-[#C9CACD] bg-[#F9F9FA] text-[#3A3D44]',
    approved:  'border-[#3A3D44] bg-[#0B0B0D] text-[#E9E9EA]',
    suspended: 'border-red-200 bg-red-50 text-red-700',
  }
  return (
    <span className={cn('inline-flex items-center border px-2.5 py-1 text-xs font-medium capitalize', map[status])}>
      {status}
    </span>
  )
}

export default function AdminPage() {
  const { user, loading } = useRequireAdmin()
  const [riders, setRiders] = useState<SafeUser[]>([])

  useEffect(() => {
    if (user) getRiders().then(setRiders)
  }, [user])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const update = async (id: string, status: RiderStatus) => {
    setRiders(await setRiderStatus(id, status))
  }
  const pendingCount = riders.filter((r) => r.riderStatus === 'pending').length

  return (
    <AppShell user={user} title="Admin">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-base font-medium text-[#0B0B0D]">Riders</h2>
        <span className="border border-[#E9E9EA] bg-[#F9F9FA] px-2.5 py-1 text-xs font-medium text-[#8D8E91]">
          {pendingCount} pending
        </span>
      </div>

      <div className="overflow-hidden border border-[#E9E9EA] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[#E9E9EA] text-left text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E9EA]">
              {riders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#8D8E91]">
                    No riders yet.
                  </td>
                </tr>
              )}
              {riders.map((r) => (
                <tr key={r.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#0B0B0D]">{r.name}</div>
                    <div className="text-xs text-[#8D8E91]">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#8D8E91]">{r.area ?? '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.riderStatus ?? 'pending'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={r.riderStatus === 'approved'}
                        onClick={() => update(r.id, 'approved')}
                        className="border border-[#E9E9EA] px-3 py-1.5 text-xs font-medium text-[#0B0B0D] transition hover:bg-[#0B0B0D] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        disabled={r.riderStatus === 'suspended'}
                        onClick={() => update(r.id, 'suspended')}
                        className="border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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
      <p className="mt-4 text-xs text-[#8D8E91]">
        Approve and Suspend update the rider&rsquo;s status in the database.
      </p>
    </AppShell>
  )
}
