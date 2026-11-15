'use server'

import { desc, eq, and, count, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import type { Order, OrderItem, OrderStatus } from '@/lib/db/schema'

/* ---------- Types exposed to the UI ---------- */

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface OrderStats {
  total: number
  pending: number
  active: number    // assigned + picked_up
  delivered: number
}

/* ---------- Create order ---------- */

export interface CreateOrderInput {
  sellerId: string
  customerName: string
  customerPhone: string
  deliveryAddress: string
  note?: string
  items: { productName: string; quantity: number; unitPrice: number }[]
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  if (!input.items.length) return { ok: false, error: 'Add at least one item' }

  const [order] = await db
    .insert(orders)
    .values({
      sellerId:        input.sellerId,
      customerName:    input.customerName.trim(),
      customerPhone:   input.customerPhone.trim(),
      deliveryAddress: input.deliveryAddress.trim(),
      note:            input.note?.trim() || null,
    })
    .returning()

  if (!order) return { ok: false, error: 'Could not create order' }

  await db.insert(orderItems).values(
    input.items.map((it) => ({
      orderId:     order.id,
      productName: it.productName.trim(),
      quantity:    it.quantity,
      unitPrice:   it.unitPrice,
    })),
  )

  return { ok: true, order }
}

/* ---------- Seller: list orders with items ---------- */

export async function getSellerOrders(sellerId: string): Promise<OrderWithItems[]> {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.sellerId, sellerId))
    .orderBy(desc(orders.createdAt))

  if (!rows.length) return []

  const ids = rows.map((o) => o.id)
  // Fetch all items for these orders in one query
  const allItems = await db
    .select()
    .from(orderItems)
    .where(sql`${orderItems.orderId} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`)

  const itemsByOrder = new Map<string, OrderItem[]>()
  for (const item of allItems) {
    const list = itemsByOrder.get(item.orderId) ?? []
    list.push(item)
    itemsByOrder.set(item.orderId, list)
  }

  return rows.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] }))
}

/* ---------- Seller: stats ---------- */

export async function getSellerStats(sellerId: string): Promise<OrderStats> {
  const rows = await db
    .select({ status: orders.status, n: count() })
    .from(orders)
    .where(eq(orders.sellerId, sellerId))
    .groupBy(orders.status)

  const map: Record<string, number> = {}
  let total = 0
  for (const r of rows) {
    map[r.status] = r.n
    total += r.n
  }

  return {
    total,
    pending:   map['pending']   ?? 0,
    active:    (map['assigned'] ?? 0) + (map['picked_up'] ?? 0),
    delivered: map['delivered'] ?? 0,
  }
}

/* ---------- Seller: cancel order ---------- */

export async function cancelOrder(
  orderId: string,
  sellerId: string,
): Promise<{ ok: boolean }> {
  const result = await db
    .update(orders)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.sellerId, sellerId),
        // Can only cancel if not yet picked up or delivered
        sql`${orders.status} IN ('pending', 'assigned')`,
      ),
    )
    .returning({ id: orders.id })

  return { ok: result.length > 0 }
}

/* ---------- Rider: list available & assigned orders ---------- */

export async function getAvailableOrders(): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(eq(orders.status, 'pending'))
    .orderBy(desc(orders.createdAt))
}

export async function getRiderOrders(riderId: string): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(and(eq(orders.riderId, riderId), sql`${orders.status} != 'cancelled'`))
    .orderBy(desc(orders.createdAt))
}

/* ---------- Rider: accept & advance order ---------- */

export async function acceptOrder(
  orderId: string,
  riderId: string,
): Promise<{ ok: boolean }> {
  const result = await db
    .update(orders)
    .set({ riderId, status: 'assigned', updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
    .returning({ id: orders.id })
  return { ok: result.length > 0 }
}

export async function advanceOrderStatus(
  orderId: string,
  riderId: string,
  to: Extract<OrderStatus, 'picked_up' | 'delivered'>,
): Promise<{ ok: boolean }> {
  const allowed: Record<typeof to, OrderStatus> = {
    picked_up: 'assigned',
    delivered: 'picked_up',
  }
  const result = await db
    .update(orders)
    .set({ status: to, updatedAt: new Date() })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.riderId, riderId),
        eq(orders.status, allowed[to]),
      ),
    )
    .returning({ id: orders.id })
  return { ok: result.length > 0 }
}

/* ---------- Rider: order with seller pickup address ---------- */

export interface OrderWithSeller extends Order {
  sellerPickupAddress: string | null
  sellerName: string | null
}

export async function getAvailableOrdersWithSeller(): Promise<OrderWithSeller[]> {
  const { users } = await import('@/lib/db/schema')

  const rows = await db
    .select({
      // all order columns
      id:              orders.id,
      sellerId:        orders.sellerId,
      riderId:         orders.riderId,
      status:          orders.status,
      customerName:    orders.customerName,
      customerPhone:   orders.customerPhone,
      deliveryAddress: orders.deliveryAddress,
      note:            orders.note,
      createdAt:       orders.createdAt,
      updatedAt:       orders.updatedAt,
      // seller columns
      sellerPickupAddress: users.pickupAddress,
      sellerName:          users.businessName,
    })
    .from(orders)
    .leftJoin(users, eq(orders.sellerId, users.id))
    .where(eq(orders.status, 'pending'))
    .orderBy(desc(orders.createdAt))

  return rows as OrderWithSeller[]
}

export async function getRiderOrdersWithSeller(riderId: string): Promise<OrderWithSeller[]> {
  const { users } = await import('@/lib/db/schema')

  const rows = await db
    .select({
      id:              orders.id,
      sellerId:        orders.sellerId,
      riderId:         orders.riderId,
      status:          orders.status,
      customerName:    orders.customerName,
      customerPhone:   orders.customerPhone,
      deliveryAddress: orders.deliveryAddress,
      note:            orders.note,
      createdAt:       orders.createdAt,
      updatedAt:       orders.updatedAt,
      sellerPickupAddress: users.pickupAddress,
      sellerName:          users.businessName,
    })
    .from(orders)
    .leftJoin(users, eq(orders.sellerId, users.id))
    .where(and(eq(orders.riderId, riderId), sql`${orders.status} != 'cancelled'`))
    .orderBy(desc(orders.createdAt))

  return rows as OrderWithSeller[]
}
