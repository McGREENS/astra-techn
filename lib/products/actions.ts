'use server'

import { eq, and, asc } from 'drizzle-orm'

import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import type { Product } from '@/lib/db/schema'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type { Product }

export interface UpsertProductInput {
  id?:          string          // present = edit, absent = create
  sellerId:     string
  name:         string
  description?: string
  price:        number          // cents
  imageDataUrl?: string | null
  available?:   boolean
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(asc(products.position), asc(products.createdAt))
}

/** Public — only available products, used on /s/[slug] */
export async function getPublicProducts(sellerId: string): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.sellerId, sellerId), eq(products.available, true)))
    .orderBy(asc(products.position), asc(products.createdAt))
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export async function upsertProduct(
  input: UpsertProductInput,
): Promise<{ ok: true; product: Product } | { ok: false; error: string }> {
  if (!input.name.trim()) return { ok: false, error: 'Name is required' }
  if (input.price < 0)    return { ok: false, error: 'Price cannot be negative' }

  if (input.id) {
    // Update — verify ownership
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, input.id), eq(products.sellerId, input.sellerId)))
      .limit(1)
    if (!existing) return { ok: false, error: 'Product not found' }

    const [updated] = await db
      .update(products)
      .set({
        name:         input.name.trim(),
        description:  input.description?.trim() || null,
        price:        input.price,
        imageDataUrl: input.imageDataUrl ?? null,
        available:    input.available ?? true,
      })
      .where(eq(products.id, input.id))
      .returning()
    return updated ? { ok: true, product: updated } : { ok: false, error: 'Update failed' }
  } else {
    // Create — assign position after existing products
    const existing = await db
      .select({ position: products.position })
      .from(products)
      .where(eq(products.sellerId, input.sellerId))
      .orderBy(asc(products.position))
    const nextPosition = existing.length > 0
      ? (existing[existing.length - 1]?.position ?? 0) + 1
      : 0

    const [created] = await db
      .insert(products)
      .values({
        sellerId:     input.sellerId,
        name:         input.name.trim(),
        description:  input.description?.trim() || null,
        price:        input.price,
        imageDataUrl: input.imageDataUrl ?? null,
        available:    input.available ?? true,
        position:     nextPosition,
      })
      .returning()
    return created ? { ok: true, product: created } : { ok: false, error: 'Could not create product' }
  }
}

export async function deleteProduct(
  id: string,
  sellerId: string,
): Promise<{ ok: boolean }> {
  const result = await db
    .delete(products)
    .where(and(eq(products.id, id), eq(products.sellerId, sellerId)))
    .returning({ id: products.id })
  return { ok: result.length > 0 }
}

export async function toggleProductAvailability(
  id: string,
  sellerId: string,
  available: boolean,
): Promise<{ ok: boolean }> {
  const result = await db
    .update(products)
    .set({ available })
    .where(and(eq(products.id, id), eq(products.sellerId, sellerId)))
    .returning({ id: products.id })
  return { ok: result.length > 0 }
}
