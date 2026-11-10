'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Bike, Store } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { useRequireGuest } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'

const CARDS = [
  {
    role: 'seller',
    title: "I'm a seller",
    desc: 'Turn posts into delivery-ready orders with your own order link.',
    icon: Store,
    href: '/signup/seller',
  },
  {
    role: 'rider',
    title: "I'm a rider",
    desc: 'Get steady delivery jobs in your area with clear pickup and drop-off.',
    icon: Bike,
    href: '/signup/rider',
  },
] as const

export default function GetStartedPage() {
  const { loading } = useRequireGuest()
  if (loading) return <PageLoader />

  return (
    <AuthLayout
      title="Get started"
      subtitle="Choose how you'll use Astra. Customers don't need an account — only sellers and riders do."
      footer={
        <Link href="/login" className="font-semibold text-[#2872A8] hover:text-[#0A1F44]">
          Already have an account? Log in{' '}
          <ArrowRight size={14} className="ml-0.5 inline" />
        </Link>
      }
    >
      <div className="grid gap-4">
        {CARDS.map((c) => (
          <Link
            key={c.role}
            href={c.href}
            className="group flex items-center gap-4 rounded-2xl border border-[#CFE6FF] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#7DC4FF] hover:shadow-[0_12px_30px_rgba(10,31,68,.06)]"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#E8F3FF] text-[#0A1F44]">
              <c.icon size={22} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-bold text-[#0A1F44]">{c.title}</span>
              <span className="mt-0.5 block text-sm text-[#48627F]">{c.desc}</span>
            </span>
            <ArrowRight
              size={18}
              className="ml-auto shrink-0 text-[#7DC4FF] transition group-hover:translate-x-0.5"
            />
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#48627F] hover:text-[#0A1F44]"
        >
          <ArrowLeft size={15} /> Back to home
        </Link>
      </div>
    </AuthLayout>
  )
}
