'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { getCurrentUser, logOut as logOutAction } from '@/lib/auth/actions'
import type { SafeUser } from '@/lib/auth/types'

interface AuthContextValue {
  user: SafeUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Re-read the current user from the server session.
  const refresh = useCallback(async () => {
    setUser(await getCurrentUser())
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const logout = useCallback(async () => {
    await logOutAction()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
