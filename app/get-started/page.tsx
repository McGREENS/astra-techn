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
        <Link
          href="/login"
          className="font-medium text-[#0B0B0D] hover:text-[#3A3D44]"
        >
          Already have an account? Log in <ArrowRight size={13} className="ml-0.5 inline" />
        </Link>
      }
    >
      <div className="grid gap-3">
        {CARDS.map((c) => (
          <Link
            key={c.role}
            href={c.href}
            className="group flex items-center gap-4 border border-[#E9E9EA] bg-white p-5 transition hover:border-[#8D8E91]"
          >
            <span className="grid size-11 shrink-0 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-[#0B0B0D]">
              <c.icon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-medium text-[#0B0B0D]">{c.title}</span>
              <span className="mt-0.5 block text-sm text-[#8D8E91]">{c.desc}</span>
            </span>
            <ArrowRight size={16} className="ml-auto shrink-0 text-[#C9CACD] transition group-hover:text-[#0B0B0D]" />
          </Link>
        ))}
      </div>
      <div className="mt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#8D8E91] hover:text-[#0B0B0D] transition"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    </AuthLayout>
  )
}
