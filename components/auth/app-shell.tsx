import type { ReactNode } from 'react'

import type { MockUser } from '@/lib/mock-auth'

import { AstraLogo } from './logo'
import { LogoutButton } from './logout-button'

/**
 * Shared chrome for the dashboard / rider / admin shells: a sticky top bar
 * with the logo, the signed-in user's name and role, and a logout button.
 */
export function AppShell({
  user,
  title,
  children,
}: {
  user: MockUser
  title: string
  children?: ReactNode
}) {
  return (
    <main className="min-h-svh bg-[#F7FBFF]">
      <header className="sticky top-0 z-10 border-b border-[#CFE6FF] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4">
          <AstraLogo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-[#48627F] sm:block">
              {user.name}
            </span>
            <span className="rounded-full bg-[#E8F3FF] px-2.5 py-1 text-xs font-bold capitalize text-[#2872A8]">
              {user.role}
            </span>
            <LogoutButton
              className="border border-[#CFE6FF] text-[#0A1F44] hover:bg-[#E8F3FF]"
            />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#0A1F44]">{title}</h1>
        <p className="mt-1 text-sm text-[#48627F]">
          Welcome back, {user.name.split(' ')[0]}.
        </p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
