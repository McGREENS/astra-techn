'use client'

import { Clock } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { useRequireRole } from '@/components/auth/guards'
import { LogoutButton } from '@/components/auth/logout-button'
import { PageLoader } from '@/components/auth/page-loader'

export default function RiderPendingPage() {
  const { user, loading } = useRequireRole('rider')
  if (loading || !user || user.role !== 'rider') return <PageLoader />

  const firstName = user.name.split(' ')[0]

  return (
    <AuthLayout
      title="Profile under review"
      subtitle={`Thanks, ${firstName}. We're reviewing your rider details.`}
    >
      <div className="grid gap-6 rounded-2xl border border-[#CFE6FF] bg-[#F7FBFF] p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E8F3FF] text-[#2872A8]">
          <Clock size={26} />
        </span>
        <p className="text-sm text-[#48627F]">
          Your profile is under review. We&rsquo;ll contact you once you&rsquo;re approved.
        </p>
        <p className="text-xs text-[#48627F]">
          Status:{' '}
          <span className="font-semibold capitalize text-[#0A1F44]">
            {user.riderStatus ?? 'pending'}
          </span>
        </p>
      </div>
      <div className="mt-6">
        <LogoutButton
          redirectTo="/login"
          className="w-full justify-center border border-[#CFE6FF] text-[#0A1F44] hover:bg-[#E8F3FF]"
        />
      </div>
    </AuthLayout>
  )
}
