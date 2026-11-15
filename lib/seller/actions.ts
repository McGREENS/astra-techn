'use server'

import { eq, ne, and } from 'drizzle-orm'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import type { User } from '@/lib/db/schema'
import { getSessionUserId } from '@/lib/auth/session'
import { slugify } from '@/lib/slug'
import type { SafeUser } from '@/lib/auth/types'

function sanitize(u: User): SafeUser {
  const { passwordHash, ...rest } = u
  return rest
}

export interface SellerSettingsInput {
  businessName: string
  category: string
  pickupAddress: string
  instagram?: string
  tiktok?: string
  logoDataUrl?: string | null
}

export type SettingsResult =
  | { ok: true; user: SafeUser }
  | { ok: false; error: string }

export async function updateSellerSettings(
  data: SellerSettingsInput,
): Promise<SettingsResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, error: 'Not authenticated' }

  // Regenerate slug only if business name changed
  const [current] = await db
    .select({ businessName: users.businessName, slug: users.slug })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!current) return { ok: false, error: 'User not found' }

  const nameChanged =
    current.businessName?.trim().toLowerCase() !==
    data.businessName.trim().toLowerCase()

  let slug = current.slug
  if (nameChanged || !slug) {
    slug = await generateUniqueSlug(data.businessName, userId)
  }

  const [updated] = await db
    .update(users)
    .set({
      businessName:  data.businessName.trim(),
      category:      data.category,
      pickupAddress: data.pickupAddress.trim(),
      instagram:     data.instagram?.trim() || null,
      tiktok:        data.tiktok?.trim() || null,
      slug,
      logoDataUrl:   data.logoDataUrl ?? null,
    })
    .where(eq(users.id, userId))
    .returning()

  return updated ? { ok: true, user: sanitize(updated) } : { ok: false, error: 'Update failed' }
}

/* ---------- Public: load seller by slug ---------- */

export async function getSellerBySlug(slug: string): Promise<SafeUser | null> {
  const [seller] = await db
    .select()
    .from(users)
    .where(and(eq(users.slug, slug), eq(users.role, 'seller')))
    .limit(1)
  return seller ? sanitize(seller) : null
}

/* ---------- Slug helper ---------- */

async function generateUniqueSlug(name: string, exceptId: string): Promise<string> {
  const base = slugify(name) || 'store'
  let slug = base
  let i = 2
  while (await slugTaken(slug, exceptId)) {
    slug = `${base}-${i++}`
  }
  return slug
}

async function slugTaken(slug: string, exceptId: string): Promise<boolean> {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.slug, slug), ne(users.id, exceptId)))
    .limit(1)
  return rows.length > 0
}
