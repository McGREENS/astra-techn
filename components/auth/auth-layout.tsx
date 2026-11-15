import type { ReactNode } from 'react'

import { AstraLogo } from './logo'

/**
 * Split layout for auth pages: obsidian brand panel on the left (desktop only),
 * form panel on the right. Collapses to a single column on mobile.
 *
 * Brand guide:
 * - Obsidian background (#0B0B0D) with white logo (no-tagline version in sidebar,
 *   full version on covers — here we use full for the brand panel).
 * - Left-aligned text, Montserrat throughout.
 * - Square corners (2 px softening on inputs via globals.css).
 * - Generous margins: 64 px on screen, 20 mm in print.
 * - Separate with hairlines and space, not boxes or shadows.
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

      {/* Brand panel — obsidian */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0B0B0D] p-16 text-white lg:flex">

        {/* Subtle flare glow — brand: flare is a focus ring / active dot, not a fill */}
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[#CFD9F6]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-80 rounded-full bg-[#C9CACD]/4 blur-3xl" />

        {/* Logo — full version on the brand panel (first impression surface) */}
        <div className="relative">
          <AstraLogo version="full" variant="white" height={56} />
        </div>

        {/* Brand copy — outcome-led, specific, no hype (brand voice guide) */}
        <div className="relative max-w-sm">
          {/* Chrome hairline above copy */}
          <div className="mb-8 w-12 border-t border-[#8D8E91]/40" />
          <h2 className="text-3xl font-light leading-tight tracking-tight text-[#E9E9EA]">
            From post to doorstep.
          </h2>
          <p className="mt-5 text-sm font-light leading-7 text-[#8D8E91]">
            One link. Instant rider dispatch. Automatic updates — so you sell more and chase less.
          </p>
          {/* Tagline trio from brand guide */}
          <div className="mt-8 flex flex-col gap-2">
            {['Innovate', 'Connect', 'Grow'].map((word) => (
              <span
                key={word}
                className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-[#C9CACD]/60"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-[#3A3D44]">© 2026 Astra Technologies</p>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col justify-center bg-white px-5 py-10 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <AstraLogo version="no-tagline" variant="black" height={28} />
          </div>

          {step && <div className="mb-6">{step}</div>}

          <div className="mb-8">
            {/* Brand: Display style — Light weight, sentence case */}
            <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D] sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[#8D8E91]">{subtitle}</p>
            )}
          </div>

          {children}

          {footer && (
            <div className="mt-6 text-sm text-[#8D8E91]">{footer}</div>
          )}
        </div>
      </section>
    </main>
  )
}
