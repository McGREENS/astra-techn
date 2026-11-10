'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import type { MockUser } from '@/lib/mock-auth'

import { useAuth } from './auth-provider'

/** Where each role lands after auth. */
export function homeForRole(user: MockUser): string {
  if (user.role === 'seller') return '/dashboard'
  if (user.role === 'rider') return '/rider/pending'
  return '/admin'
}

/**
 * Protect a page that requires a logged-in user of any role.
 * Redirects logged-out users to /login.
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])
  return { user, loading }
}

/**
 * Protect a page that requires a specific role (e.g. onboarding steps).
 * Logged-out -> /login; wrong role -> that role's home.
 */
export function useRequireRole(role: MockUser['role']) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if (user.role !== role) router.replace(homeForRole(user))
  }, [loading, user, role, router])
  return { user, loading }
}

/** Admin-only page. */
export function useRequireAdmin() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.replace('/login')
  }, [loading, user, router])
  return { user, loading }
}

/**
 * Guest-only page (signup / login / get-started).
 * Redirects users who were ALREADY logged in when the page first resolved.
 * Uses a one-shot check so the in-flow signup (which logs you in mid-submit)
 * does not bounce you away before you reach the next step.
 */
export function useRequireGuest() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const checkedRef = useRef(false)
  useEffect(() => {
    if (loading || checkedRef.current) return
    checkedRef.current = true
    if (user) router.replace(homeForRole(user))
  }, [loading, user, router])
  return { user, loading }
}
