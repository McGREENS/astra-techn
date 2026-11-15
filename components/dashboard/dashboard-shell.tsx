'use client'

import { useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'

import { DesktopSidebar, MobileSidebar, type NavItem } from './sidebar'
import { AstraLogo } from '@/components/auth/logo'
import type { SafeUser } from '@/lib/auth/types'

export function DashboardShell({
  user,
  navItems,
  children,
}: {
  user: SafeUser
  navItems: NavItem[]
  children: ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-[#F9F9FA]">

      {/* Desktop: static in-flow sidebar with its own padding/gap */}
      <DesktopSidebar user={user} navItems={navItems} />

      {/* Mobile: fixed overlay drawer — renders outside the flow, invisible until opened */}
      <MobileSidebar
        user={user}
        navItems={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content — takes remaining width */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar — hidden on lg+ */}
        <header className="flex items-center gap-4 border-b border-[#E9E9EA] bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="grid size-9 place-items-center rounded-sm border border-[#E9E9EA] text-[#0B0B0D] hover:bg-[#F9F9FA] transition"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <AstraLogo version="no-tagline" variant="black" height={22} />
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
