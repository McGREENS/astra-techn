'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

import { getCurrentUser, logout as mockLogout, type MockUser } from '@/lib/mock-auth'

interface AuthContextValue {
  user: MockUser | null
  loading: boolean
  refresh: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => setUser(getCurrentUser()), [])

  useEffect(() => {
    setUser(getCurrentUser())
    setLoading(false)
  }, [])

  const logout = useCallback(() => {
    mockLogout()
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
