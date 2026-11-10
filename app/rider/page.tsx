'use client'

import { AppShell } from '@/components/auth/app-shell'
import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'

export default function RiderPage() {
  const { user, loading } = useRequireRole('rider')
  if (loading || !user || user.role !== 'rider') return <PageLoader />

  const status = user.riderStatus ?? 'pending'

  return (
    <AppShell user={user} title="Rider dashboard">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#CFE6FF] bg-white p-5">
        <span className="text-sm font-medium text-[#48627F]">Approval status</span>
        <span
          className={
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ' +
            (status === 'approved'
              ? 'bg-emerald-50 text-emerald-700'
              : status === 'suspended'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700')
          }
        >
          {status}
        </span>
      </div>
      <p className="mt-6 text-sm text-[#48627F]">
        This is a placeholder rider dashboard. Available delivery jobs will appear here once the
        backend is connected.{' '}
        {status === 'pending' && 'You can start accepting jobs after your profile is approved.'}
      </p>
    </AppShell>
  )
}
