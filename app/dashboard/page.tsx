'use client'

import { AppShell } from '@/components/auth/app-shell'
import { useRequireAuth } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()
  if (loading || !user) return <PageLoader />

  return (
    <AppShell user={user} title="Seller dashboard">
      {user.slug && (
        <div className="rounded-2xl border border-[#CFE6FF] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#4C99D4]">
            Your order link
          </p>
          <p className="mt-1 text-lg font-bold text-[#0A1F44]">astra.com/s/{user.slug}</p>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Orders today', '0'],
          ['Active deliveries', '0'],
          ['Pending reviews', '0'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#CFE6FF] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#48627F]">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[#0A1F44]">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-[#48627F]">
        This is a placeholder dashboard. Real order, delivery, and catalog data will appear
        here once the backend is connected.
      </p>
    </AppShell>
  )
}
