'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useAuth } from './auth-provider'

export function LogoutButton({
  className,
  redirectTo = '/login',
  label = 'Log out',
}: {
  className?: string
  redirectTo?: string
  label?: string
}) {
  const { logout } = useAuth()
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => {
        logout()
        router.push(redirectTo)
      }}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
        className,
      )}
    >
      <LogOut size={16} /> {label}
    </button>
  )
}
