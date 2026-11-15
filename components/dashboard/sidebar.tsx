'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type LucideIcon, LogOut, X } from 'lucide-react'

import { AstraLogo } from '@/components/auth/logo'
import { cn } from '@/lib/utils'
import type { SafeUser } from '@/lib/auth/types'
import { useAuth } from '@/components/auth/auth-provider'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exact?: boolean
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-all',
        active
          ? 'bg-white/10 text-white'
          : 'text-[#8D8E91] hover:bg-white/[0.06] hover:text-[#C9CACD]',
      )}
    >
      <Icon
        size={16}
        className={cn(
          'shrink-0 transition-colors',
          active ? 'text-[#CFD9F6]' : 'text-[#8D8E91]',
        )}
      />
      {item.label}
    </Link>
  )
}

/** The inner panel — shared between desktop (static) and mobile (fixed drawer). */
function SidebarPanel({
  user,
  navItems,
  onClose,
  showClose,
}: {
  user: SafeUser
  navItems: NavItem[]
  onClose: () => void
  showClose: boolean
}) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const firstName = user.name.split(' ')[0]
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-full flex-col bg-[#0B0B0D]">
      {/* Logo — white version on obsidian */}
      <div className="flex items-center justify-between px-5 py-5">
        <AstraLogo version="no-tagline" variant="white" href="/dashboard" height={28} />
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-sm text-[#8D8E91] hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Chrome hairline */}
      <div className="mx-5 border-t border-[#3A3D44]" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={showClose ? onClose : undefined} />
        ))}
      </nav>

      {/* Chrome hairline */}
      <div className="mx-5 border-t border-[#3A3D44]" />

      {/* User + logout */}
      <div className="px-4 py-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-[#3A3D44] text-xs font-bold text-[#C9CACD]">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#E9E9EA]">{firstName}</p>
            <p className="truncate text-xs text-[#8D8E91]">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-widest text-[#8D8E91] hover:bg-white/[0.06] hover:text-[#C9CACD] transition-colors"
        >
          <LogOut size={14} className="shrink-0" />
          Log out
        </button>
      </div>
    </div>
  )
}

/**
 * Desktop sidebar — always visible, in document flow, rounded on all sides,
 * floating inside a 16px inset from the viewport edge.
 */
export function DesktopSidebar({ user, navItems }: { user: SafeUser; navItems: NavItem[] }) {
  return (
    <div className="hidden lg:block lg:w-60 lg:shrink-0 lg:p-4">
      <div className="sticky top-4 h-[calc(100dvh-32px)] overflow-hidden rounded-xl">
        <SidebarPanel user={user} navItems={navItems} onClose={() => {}} showClose={false} />
      </div>
    </div>
  )
}

/**
 * Mobile sidebar — hidden by default, slides in as a fixed left drawer.
 * The backdrop click closes it.
 */
export function MobileSidebar({
  user,
  navItems,
  open,
  onClose,
}: {
  user: SafeUser
  navItems: NavItem[]
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-full overflow-hidden">
          <SidebarPanel user={user} navItems={navItems} onClose={onClose} showClose={true} />
        </div>
      </div>
    </>
  )
}
