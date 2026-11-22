'use server'

import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt, isNull, ne } from 'drizzle-orm'

import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/db/schema'
import type { User } from '@/lib/db/schema'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { createSession, destroySession, getSessionUserId } from '@/lib/auth/session'
import { slugify } from '@/lib/slug'
import { sendWelcomeRider, sendWelcomeSeller, sendPasswordReset } from '@/lib/email/mailer'
import type { RiderStatus, SafeUser } from '@/lib/auth/types'

type AuthResult = { ok: true; user: SafeUser } | { ok: false; error: string }

/** Strip the password hash so it never leaves the server. */
function sanitize(u: User): SafeUser {
  const { passwordHash, ...rest } = u
  return rest
}

/* -------------------------------- Sign up ------------------------------ */

export async function signUp(input: {
  name: string
  email: string
  phone: string
  password: string
  role: 'seller' | 'rider'
}): Promise<AuthResult> {
  const email = input.email.trim().toLowerCase()

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  if (existing) return { ok: false, error: 'This email is already registered' }

  const passwordHash = await hashPassword(input.password)
  const [created] = await db
    .insert(users)
    .values({
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      passwordHash,
      role: input.role,
      riderStatus: input.role === 'rider' ? 'pending' : null,
    })
    .returning()

  if (!created) return { ok: false, error: 'Could not create account' }
  await createSession(created.id)

  // Fire-and-forget — email failure must not block account creation.
  if (created.role === 'seller') {
    sendWelcomeSeller({ name: created.name, email: created.email })
  } else {
    sendWelcomeRider({ name: created.name, email: created.email })
  }

  return { ok: true, user: sanitize(created) }
}

/* --------------------------------- Log in ------------------------------ */

export async function logIn(email: string, password: string): Promise<AuthResult> {
  const e = email.trim().toLowerCase()
  const [user] = await db.select().from(users).where(eq(users.email, e)).limit(1)
  if (!user) return { ok: false, error: 'Invalid email or password' }
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return { ok: false, error: 'Invalid email or password' }
  await createSession(user.id)
  return { ok: true, user: sanitize(user) }
}

/* --------------------------------- Log out ----------------------------- */

export async function logOut(): Promise<void> {
  await destroySession()
}

/* ------------------------------ Current user --------------------------- */

export async function getCurrentUser(): Promise<SafeUser | null> {
  const id = await getSessionUserId()
  if (!id) return null
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ? sanitize(user) : null
}

/* --------------------------- Seller onboarding ------------------------- */

export async function completeSellerOnboarding(
  userId: string,
  data: {
    businessName: string
    category: string
    pickupAddress: string
    instagram?: string
    tiktok?: string
  },
): Promise<SafeUser | null> {
  const slug = await generateUniqueSlug(data.businessName, userId)
  const [updated] = await db
    .update(users)
    .set({
      businessName: data.businessName.trim(),
      category: data.category,
      pickupAddress: data.pickupAddress.trim(),
      instagram: data.instagram?.trim() || null,
      tiktok: data.tiktok?.trim() || null,
      slug,
    })
    .where(eq(users.id, userId))
    .returning()
  return updated ? sanitize(updated) : null
}

/* --------------------------- Rider onboarding -------------------------- */

export async function completeRiderOnboarding(
  userId: string,
  data: {
    nationalId: string
    plateNumber: string
    area: string
    photoDataUrl?: string
  },
): Promise<SafeUser | null> {
  const [updated] = await db
    .update(users)
    .set({
      nationalId: data.nationalId.trim(),
      plateNumber: data.plateNumber.trim(),
      area: data.area,
      photoDataUrl: data.photoDataUrl ?? null,
      riderStatus: 'pending',
    })
    .where(eq(users.id, userId))
    .returning()
  return updated ? sanitize(updated) : null
}

/* --------------------------------- Admin ------------------------------- */

export async function getRiders(): Promise<SafeUser[]> {
  const rows = await db.select().from(users).where(eq(users.role, 'rider'))
  return rows.map(sanitize)
}

export async function setRiderStatus(
  id: string,
  status: RiderStatus,
): Promise<SafeUser[]> {
  await db.update(users).set({ riderStatus: status }).where(eq(users.id, id))
  return getRiders()
}

/* ---------------------------- Forgot password -------------------------- */

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true }> {
  // Always return ok — never reveal whether the email exists.
  const e = email.trim().toLowerCase()
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email })
    .from(users).where(eq(users.email, e)).limit(1)

  if (user) {
    // Create a cryptographically random token, store its hash.
    const rawToken   = randomBytes(32).toString('hex')
    const tokenHash  = createHash('sha256').update(rawToken).digest('hex')
    const expiresAt  = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Invalidate any previous unused tokens for this user
    await db.delete(passwordResetTokens)
      .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)))

    await db.insert(passwordResetTokens).values({
      userId:    user.id,
      tokenHash,
      expiresAt,
    })

    const baseUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://astra.africa/'
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`
    // Must await — in a serverless environment the function is killed after the
    // response is sent, so a fire-and-forget promise would never complete.
    await sendPasswordReset({ name: user.name, email: user.email, resetUrl })
  }

  return { ok: true }
}

export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const now = new Date()

  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1)

  if (!record) return { ok: false, error: 'This link is invalid or has expired.' }

  const passwordHash = await hashPassword(newPassword)
  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId))
  await db.update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, record.id))

  return { ok: true }
}

/* ------------------------------- Slug helper ---------------------------- */

async function generateUniqueSlug(name: string, exceptId?: string): Promise<string> {
  const base = slugify(name) || 'store'
  let slug = base
  let i = 2
  while (await slugTaken(slug, exceptId)) {
    slug = `${base}-${i++}`
  }
  return slug
}

async function slugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const conds = [eq(users.slug, slug)]
  if (exceptId) conds.push(ne(users.id, exceptId))
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(...conds))
    .limit(1)
  return rows.length > 0
}

/* -------------------- Rider status poll (used by /rider/pending) ---- */

/** Returns just the rider_status for the current session user.
 *  Lightweight — called every few seconds from the pending page. */
export async function getRiderStatus(): Promise<string | null> {
  const id = await getSessionUserId()
  if (!id) return null
  const [row] = await db
    .select({ riderStatus: users.riderStatus })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return row?.riderStatus ?? null
}
