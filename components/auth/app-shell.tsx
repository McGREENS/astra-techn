import type { ReactNode } from 'react'
import type { SafeUser } from '@/lib/auth/types'
import { AstraLogo } from './logo'
import { LogoutButton } from './logout-button'

/**
 * Shared chrome for the admin shell.
 * Dashboard and rider pages use DashboardShell + sidebar instead.
 */
export function AppShell({
  user,
  title,
  children,
}: {
  user: SafeUser
  title: string
  children?: ReactNode
}) {
  return (
    <main className="min-h-svh bg-[#F9F9FA]">
      <header className="sticky top-0 z-10 border-b border-[#E9E9EA] bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4">
          <AstraLogo version="no-tagline" variant="black" height={22} />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#8D8E91] sm:block">{user.name}</span>
            <span className="border border-[#E9E9EA] bg-[#F9F9FA] px-2.5 py-1 text-xs font-medium uppercase tracking-widest text-[#3A3D44]">
              {user.role}
            </span>
            <LogoutButton className="border border-[#E9E9EA] text-[#0B0B0D] hover:bg-[#F9F9FA]" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">{title}</h1>
        <p className="mt-1 text-sm text-[#8D8E91]">Welcome back, {user.name.split(' ')[0]}.</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
