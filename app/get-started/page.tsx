'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Store, Truck } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { useRequireGuest } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'

export default function GetStartedPage() {
  const { loading } = useRequireGuest()
  if (loading) return <PageLoader />

  return (
    <AuthLayout
      title="Get started"
      subtitle="Create a seller account to start accepting delivery orders."
      footer={
        <Link
          href="/login"
          className="font-medium text-[#0B0B0D] hover:text-[#3A3D44]"
        >
          Already have an account? Log in{' '}
          <ArrowRight size={13} className="ml-0.5 inline" />
        </Link>
      }
    >
      <div className="grid gap-3">

        {/* Seller — the only public signup path */}
        <Link
          href="/signup/seller"
          className="group flex items-center gap-4 border border-[#E9E9EA] bg-white p-5 transition hover:border-[#8D8E91]"
        >
          <span className="grid size-11 shrink-0 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-[#0B0B0D]">
            <Store size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-medium text-[#0B0B0D]">I&rsquo;m a seller</span>
            <span className="mt-0.5 block text-sm text-[#8D8E91]">
              Turn your posts into delivery-ready orders with your own order link.
            </span>
          </span>
          <ArrowRight size={16} className="ml-auto shrink-0 text-[#C9CACD] transition group-hover:text-[#0B0B0D]" />
        </Link>

        {/* Delivery company — not a public signup, directs to contact */}
        <div className="flex items-center gap-4 border border-dashed border-[#E9E9EA] bg-[#F9F9FA] p-5">
          <span className="grid size-11 shrink-0 place-items-center border border-[#E9E9EA] bg-white text-[#C9CACD]">
            <Truck size={20} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-medium text-[#8D8E91]">Delivery company</span>
            <span className="mt-0.5 block text-sm text-[#C9CACD]">
              Delivery company accounts are set up by the Astra team.{' '}
              <a
                href="mailto:hello@astra.africa"
                className="font-medium text-[#0B0B0D] hover:text-[#3A3D44] transition"
              >
                Contact us →
              </a>
            </span>
          </span>
        </div>

      </div>

      {/* Rider note */}
      <p className="mt-4 text-xs text-[#C9CACD]">
        Riders are registered by their delivery company, not through this page.
      </p>

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
