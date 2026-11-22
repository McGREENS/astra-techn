'use server'

import { count, eq, sum, desc, gte, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { users, orders, orderItems } from '@/lib/db/schema'
import type { User, Order } from '@/lib/db/schema'
import type { SafeUser } from '@/lib/auth/types'

function sanitize(u: User): SafeUser {
  const { passwordHash, ...rest } = u
  return rest
}

/* ------------------------------------------------------------------ */
/* Overview stats                                                      */
/* ------------------------------------------------------------------ */

export interface PlatformStats {
  orders: {
    total:     number
    pending:   number
    active:    number   // assigned + picked_up
    delivered: number
    cancelled: number
  }
  revenue: number  // cents — sum of delivered order items
  users: {
    sellers:         number
    ridersTotal:     number
    ridersPending:   number
    ridersApproved:  number
    ridersSuspended: number
  }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [orderRows, userRows, revenueRow] = await Promise.all([
    db.select({ status: orders.status, n: count() })
      .from(orders).groupBy(orders.status),

    db.select({ role: users.role, riderStatus: users.riderStatus, n: count() })
      .from(users).groupBy(users.role, users.riderStatus),

    db.select({ total: sum(orderItems.unitPrice) })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orders.status, 'delivered')),
  ])

  const om: Record<string, number> = {}
  for (const r of orderRows) om[r.status] = r.n

  const sellers        = userRows.filter(r => r.role === 'seller').reduce((s, r) => s + r.n, 0)
  const ridersPending  = userRows.filter(r => r.role === 'rider' && r.riderStatus === 'pending').reduce((s, r) => s + r.n, 0)
  const ridersApproved = userRows.filter(r => r.role === 'rider' && r.riderStatus === 'approved').reduce((s, r) => s + r.n, 0)
  const ridersSuspended= userRows.filter(r => r.role === 'rider' && r.riderStatus === 'suspended').reduce((s, r) => s + r.n, 0)

  return {
    orders: {
      total:     Object.values(om).reduce((s, n) => s + n, 0),
      pending:   om['pending']   ?? 0,
      active:    (om['assigned'] ?? 0) + (om['picked_up'] ?? 0),
      delivered: om['delivered'] ?? 0,
      cancelled: om['cancelled'] ?? 0,
    },
    revenue: Number(revenueRow[0]?.total ?? 0),
    users: {
      sellers,
      ridersTotal:     ridersPending + ridersApproved + ridersSuspended,
      ridersPending,
      ridersApproved,
      ridersSuspended,
    },
  }
}

/* ------------------------------------------------------------------ */
/* Orders per day — last N days (for the bar chart)                   */
/* ------------------------------------------------------------------ */

export interface DailyCount { date: string; count: number }

export async function getOrdersPerDay(days = 7): Promise<DailyCount[]> {
  const since = new Date()
  since.setDate(since.getDate() - days + 1)
  since.setHours(0, 0, 0, 0)

  const rows = await db
    .select({
      date: sql<string>`date(${orders.createdAt}, 'unixepoch')`,
      count: count(),
    })
    .from(orders)
    .where(gte(orders.createdAt, since))
    .groupBy(sql`date(${orders.createdAt}, 'unixepoch')`)
    .orderBy(sql`date(${orders.createdAt}, 'unixepoch')`)

  // Fill in missing days with 0
  const map = new Map(rows.map(r => [r.date, r.count]))
  const result: DailyCount[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map.get(key) ?? 0 })
  }
  return result
}

/* ------------------------------------------------------------------ */
/* All orders with seller name                                         */
/* ------------------------------------------------------------------ */

export interface AdminOrder extends Order {
  sellerName:     string | null
  sellerBusiness: string | null
  itemCount:      number
  totalCents:     number
}

export async function getAllOrders(): Promise<AdminOrder[]> {
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
      sellerName:      users.name,
      sellerBusiness:  users.businessName,
    })
    .from(orders)
    .leftJoin(users, eq(orders.sellerId, users.id))
    .orderBy(desc(orders.createdAt))

  if (!rows.length) return []

  // Fetch totals per order in one query
  const totals = await db
    .select({
      orderId:    orderItems.orderId,
      itemCount:  count(),
      totalCents: sum(sql`${orderItems.unitPrice} * ${orderItems.quantity}`),
    })
    .from(orderItems)
    .groupBy(orderItems.orderId)

  const totalsMap = new Map(totals.map(t => [t.orderId, t]))

  return rows.map(r => ({
    ...r,
    itemCount:  totalsMap.get(r.id)?.itemCount  ?? 0,
    totalCents: Number(totalsMap.get(r.id)?.totalCents ?? 0),
  })) as AdminOrder[]
}

/* ------------------------------------------------------------------ */
/* All sellers                                                         */
/* ------------------------------------------------------------------ */

export interface AdminSeller extends SafeUser {
  orderCount: number
}

export async function getAllSellers(): Promise<AdminSeller[]> {
  const sellers = await db
    .select().from(users).where(eq(users.role, 'seller'))

  if (!sellers.length) return []

  const counts = await db
    .select({ sellerId: orders.sellerId, n: count() })
    .from(orders)
    .groupBy(orders.sellerId)

  const countMap = new Map(counts.map(c => [c.sellerId, c.n]))

  return sellers.map(s => ({
    ...sanitize(s),
    orderCount: countMap.get(s.id) ?? 0,
  }))
}

/* ------------------------------------------------------------------ */
/* All riders (with full detail for review)                           */
/* ------------------------------------------------------------------ */

export async function getAllRiders(): Promise<SafeUser[]> {
  const rows = await db
    .select().from(users).where(eq(users.role, 'rider'))
    .orderBy(desc(users.createdAt))
  return rows.map(sanitize)
}

export async function adminSetRiderStatus(
  id: string,
  status: 'approved' | 'suspended' | 'pending',
): Promise<void> {
  await db.update(users).set({ riderStatus: status }).where(eq(users.id, id))
}

/* ------------------------------------------------------------------ */
/* Cancel any order (admin power)                                      */
/* ------------------------------------------------------------------ */

export async function adminCancelOrder(orderId: string): Promise<void> {
  await db.update(orders)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(orders.id, orderId))
}
