import type { ReactNode } from 'react'

import { AstraLogo } from './logo'

/**
 * Split layout for auth pages: navy brand panel on the left (desktop only),
 * form on the right. Collapses to a single column with a compact logo on mobile.
 */
export function AuthLayout({
  title,
  subtitle,
  step,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  step?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-[0.9fr_1.1fr]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A1F44] p-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-[#7DC4FF]/15 blur-2xl" />
        <div className="absolute -bottom-16 left-0 size-72 rounded-full bg-[#2872A8]/30 blur-3xl" />
        <div className="relative">
          <AstraLogo light />
        </div>
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Delivery for the social commerce era.
          </h2>
          <p className="mt-4 leading-7 text-[#BFD2EA]">
            One link, instant rider dispatch, and automatic updates — so you can sell
            more and chase less.
          </p>
        </div>
        <p className="relative text-xs text-[#9CB2CF]">© 2026 Astra Technologies</p>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <AstraLogo />
          </div>
          {step && <div className="mb-6">{step}</div>}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#0A1F44] sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-[#48627F]">{subtitle}</p>}
          </div>
          {children}
          {footer && <div className="mt-6 text-sm text-[#48627F]">{footer}</div>}
        </div>
      </section>
    </main>
  )
}
