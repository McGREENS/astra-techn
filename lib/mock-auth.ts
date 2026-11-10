/**
 * Mock auth helper — FRONT END ONLY.
 *
 * Everything here is a stand-in for a real backend. Data lives in localStorage
 * and every async action simulates network latency (~800ms) so the UI can show
 * realistic loading states. When a real backend exists, replace the bodies of
 * the async functions with real API calls and delete the localStorage code; the
 * function signatures are deliberately shaped like an auth service so the swap
 * is straightforward.
 */

export type Role = 'seller' | 'rider' | 'admin'
export type RiderStatus = 'pending' | 'approved' | 'suspended'

export interface MockUser {
  id: string
  role: Role
  name: string
  email: string
  phone?: string
  password: string // plaintext — demo only, never do this for real
  createdAt: number

  // seller onboarding
  businessName?: string
  category?: string
  pickupAddress?: string
  instagram?: string
  tiktok?: string
  slug?: string

  // rider onboarding
  nationalId?: string
  plateNumber?: string
  area?: string
  photoDataUrl?: string
  riderStatus?: RiderStatus
}

const USERS_KEY = 'astra_users_v1'
const SESSION_KEY = 'astra_session_v1'
const SEED_KEY = 'astra_seeded_v1'

/** Built-in demo admin. Has no signup flow; log in with these credentials. */
export const DEMO_ADMIN: MockUser = {
  id: 'admin-demo',
  role: 'admin',
  name: 'Astra Admin',
  email: 'admin@astra.com',
  password: 'admin1234',
  createdAt: 0,
}

const LATENCY = 800

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readUsers(): MockUser[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as MockUser[]) : []
  } catch {
    return []
  }
}

function writeUsers(users: MockUser[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function genId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10)
}

/** Seed a few demo riders on first run so the admin table isn't empty. */
function ensureSeed(): void {
  if (!isBrowser()) return
  if (window.localStorage.getItem(SEED_KEY)) return
  const existing = readUsers()
  const seeds: MockUser[] = [
    {
      id: 'r_seed_jon',
      role: 'rider',
      name: 'Jon Brewster',
      email: 'jon@example.com',
      phone: '+1 555 0102',
      password: 'password',
      nationalId: 'ID-992013',
      plateNumber: 'ABC-1234',
      area: 'Downtown',
      riderStatus: 'pending',
      createdAt: Date.now() - 86_400_000,
    },
    {
      id: 'r_seed_leila',
      role: 'rider',
      name: 'Leila Mansour',
      email: 'leila@example.com',
      phone: '+1 555 0177',
      password: 'password',
      nationalId: 'ID-778451',
      plateNumber: 'XYZ-9988',
      area: 'Westside',
      riderStatus: 'pending',
      createdAt: Date.now() - 43_200_000,
    },
    {
      id: 'r_seed_david',
      role: 'rider',
      name: 'David Okafor',
      email: 'david@example.com',
      phone: '+1 555 0190',
      password: 'password',
      nationalId: 'ID-552312',
      plateNumber: 'LMN-4567',
      area: 'Eastside',
      riderStatus: 'approved',
      createdAt: Date.now() - 21_600_000,
    },
  ]
  writeUsers([...existing, ...seeds])
  window.localStorage.setItem(SEED_KEY, '1')
}

function setSession(userId: string): void {
  if (!isBrowser()) return
  window.localStorage.setItem(SESSION_KEY, userId)
}

function clearSession(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(SESSION_KEY)
}

/* ------------------------------------------------------------------ */
/* Synchronous helpers (used by zod validation and the admin table)   */
/* ------------------------------------------------------------------ */

export function getCurrentUser(): MockUser | null {
  if (!isBrowser()) return null
  const id = window.localStorage.getItem(SESSION_KEY)
  if (!id) return null
  if (id === DEMO_ADMIN.id) return DEMO_ADMIN
  return readUsers().find((u) => u.id === id) ?? null
}

export function emailExists(email: string, exceptId?: string): boolean {
  if (!isBrowser()) return false
  const e = email.trim().toLowerCase()
  if (e === DEMO_ADMIN.email) return true
  return readUsers().some((u) => u.id !== exceptId && u.email.toLowerCase() === e)
}

export function slugFromName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'store'
}

export function slugExists(slug: string, exceptId?: string): boolean {
  if (!isBrowser()) return false
  return readUsers().some((u) => u.id !== exceptId && u.slug === slug)
}

/** Generate a slug from a business name, appending -2, -3, … to avoid collisions. */
export function generateUniqueSlug(name: string, exceptId?: string): string {
  const base = slugFromName(name)
  let slug = base
  let i = 2
  while (slugExists(slug, exceptId)) {
    slug = `${base}-${i}`
    i += 1
  }
  return slug
}

/* ------------------------------------------------------------------ */
/* Async actions (simulate latency)                                   */
/* ------------------------------------------------------------------ */

export interface SignupInput {
  name: string
  email: string
  phone: string
  password: string
  role: Extract<Role, 'seller' | 'rider'>
}

export type SignupResult = { ok: true; user: MockUser } | { ok: false; error: string }

export async function signup(input: SignupInput): Promise<SignupResult> {
  if (emailExists(input.email)) {
    return delay({ ok: false, error: 'This email is already registered' })
  }
  const user: MockUser = {
    id: genId(),
    role: input.role,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    password: input.password,
    riderStatus: input.role === 'rider' ? 'pending' : undefined,
    createdAt: Date.now(),
  }
  const users = readUsers()
  users.push(user)
  writeUsers(users)
  setSession(user.id)
  return delay({ ok: true, user })
}

export interface SellerOnboardingInput {
  businessName: string
  category: string
  pickupAddress: string
  instagram?: string
  tiktok?: string
  slug: string
}

export async function completeSellerOnboarding(
  userId: string,
  data: SellerOnboardingInput,
): Promise<MockUser | null> {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return delay(null)
  users[idx] = {
    ...users[idx],
    businessName: data.businessName.trim(),
    category: data.category,
    pickupAddress: data.pickupAddress.trim(),
    instagram: data.instagram?.trim() || undefined,
    tiktok: data.tiktok?.trim() || undefined,
    slug: data.slug,
  }
  writeUsers(users)
  return delay(users[idx])
}

export interface RiderOnboardingInput {
  nationalId: string
  plateNumber: string
  area: string
  photoDataUrl?: string
}

export async function completeRiderOnboarding(
  userId: string,
  data: RiderOnboardingInput,
): Promise<MockUser | null> {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx === -1) return delay(null)
  users[idx] = {
    ...users[idx],
    nationalId: data.nationalId.trim(),
    plateNumber: data.plateNumber.trim(),
    area: data.area,
    photoDataUrl: data.photoDataUrl,
    riderStatus: 'pending',
  }
  writeUsers(users)
  return delay(users[idx])
}

export type LoginResult = { ok: true; user: MockUser } | { ok: false; error: string }

export async function login(email: string, password: string): Promise<LoginResult> {
  ensureSeed()
  const e = email.trim().toLowerCase()
  if (e === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
    setSession(DEMO_ADMIN.id)
    return delay({ ok: true, user: DEMO_ADMIN })
  }
  const user = readUsers().find((u) => u.email.toLowerCase() === e)
  if (!user || user.password !== password) {
    return delay({ ok: false, error: 'Invalid email or password' })
  }
  setSession(user.id)
  return delay({ ok: true, user })
}

export function logout(): void {
  clearSession()
}

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  // Always succeeds in the demo — never reveal whether an email exists.
  return delay({ ok: true }, 800)
}

/* ------------------------------------------------------------------ */
/* Admin rider management (synchronous; UI updates locally)           */
/* ------------------------------------------------------------------ */

export function getRiders(): MockUser[] {
  ensureSeed()
  return readUsers().filter((u) => u.role === 'rider')
}

export function setRiderStatus(id: string, status: RiderStatus): MockUser[] {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx !== -1) {
    users[idx].riderStatus = status
    writeUsers(users)
  }
  return getRiders()
}
