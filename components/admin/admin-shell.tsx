'use client'

import type { ReactNode } from 'react'
import {
  Bike, Building2, LayoutDashboard,
  Mail, ReceiptText, Store,
} from 'lucide-react'

import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import type { SafeUser } from '@/lib/auth/types'
import type { NavItem } from '@/components/dashboard/sidebar'

export const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',   href: '/admin',             icon: LayoutDashboard, exact: true },
  { label: 'Orders',     href: '/admin/orders',       icon: ReceiptText },
  { label: 'Riders',     href: '/admin/riders',       icon: Bike },
  { label: 'Sellers',    href: '/admin/sellers',      icon: Store },
  { label: 'Companies',  href: '/admin/companies',    icon: Building2 },
  { label: 'Enquiries',  href: '/admin/enquiries',    icon: Mail },
]

export function AdminShell({
  user,
  children,
}: {
  user: SafeUser
  children: ReactNode
}) {
  return (
    <DashboardShell user={user} navItems={ADMIN_NAV}>
      {children}
    </DashboardShell>
  )
}
