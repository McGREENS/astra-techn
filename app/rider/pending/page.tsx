'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, RefreshCw } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { useRequireRole } from '@/components/auth/guards'
import { useAuth } from '@/components/auth/auth-provider'
import { LogoutButton } from '@/components/auth/logout-button'
import { PageLoader } from '@/components/auth/page-loader'
import { getRiderStatus } from '@/lib/auth/actions'

const POLL_MS = 8_000

export default function RiderPendingPage() {
  const { user, loading } = useRequireRole('rider')
  const { refresh }       = useAuth()
  const router            = useRouter()
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user || user.riderStatus !== 'pending') return

    async function poll() {
      setChecking(true)
      const status = await getRiderStatus()
      setChecking(false)
      if (status === 'approved') { await refresh(); router.replace('/rider') }
      else if (status === 'suspended') { await refresh() }
    }

    poll()
    timerRef.current = setInterval(poll, POLL_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [user?.id, user?.riderStatus, refresh, router]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user || user.role !== 'rider') return <PageLoader />

  const firstName = user.name.split(' ')[0]
  const status    = user.riderStatus ?? 'pending'

  if (status === 'approved') { router.replace('/rider'); return <PageLoader /> }

  return (
    <AuthLayout
      title={status === 'suspended' ? 'Account suspended' : 'Profile under review'}
      subtitle={
        status === 'suspended'
          ? 'Your account has been suspended. Please contact support.'
          : `Thanks, ${firstName}. We're reviewing your rider details.`
      }
    >
      <div className="grid gap-5">

        {/* Status card */}
        <div className="grid gap-4 border border-[#E9E9EA] bg-[#F9F9FA] p-6 text-center">
          <span className={`mx-auto grid size-12 place-items-center border ${status === 'suspended' ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#E9E9EA] bg-white text-[#0B0B0D]'}`}>
            <Clock size={22} />
          </span>

          {status === 'suspended' ? (
            <p className="text-sm text-[#8D8E91]">
              Please contact{' '}
              <a href="mailto:support@astra.africa" className="font-medium text-[#0B0B0D]">
                support@astra.africa
              </a>{' '}
              for more information.
            </p>
          ) : (
            <>
              <p className="text-sm text-[#8D8E91]">
                Your profile is being reviewed. This usually takes less than 24 hours.
                We&rsquo;ll redirect you automatically once you&rsquo;re approved.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-[#C9CACD]">
                <RefreshCw size={11} className={checking ? 'animate-spin text-[#8D8E91]' : ''} />
                {checking ? 'Checking status…' : 'Checking every 8 seconds'}
              </div>
            </>
          )}

          <div className="flex justify-center">
            <span className={`inline-flex items-center border px-3 py-1 text-xs font-medium uppercase tracking-widest ${status === 'suspended' ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#E9E9EA] bg-white text-[#8D8E91]'}`}>
              {status}
            </span>
          </div>
        </div>

        {/* What happens next */}
        {status !== 'suspended' && (
          <div className="border border-[#E9E9EA] bg-white px-5 py-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#C9CACD]">What happens next</p>
            <ol className="flex flex-col gap-2.5">
              {[
                'Our team reviews your national ID, plate number, and photo.',
                "Once approved, you'll be redirected to the jobs dashboard automatically.",
                'You can then start accepting delivery jobs in your area.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#8D8E91]">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-xs font-medium text-[#0B0B0D]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <LogoutButton
          redirectTo="/login"
          className="w-full justify-center border border-[#E9E9EA] text-[#0B0B0D] hover:bg-[#F9F9FA]"
        />
      </div>
    </AuthLayout>
  )
}
