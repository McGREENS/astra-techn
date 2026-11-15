// Drizzle schema — the single source of truth for the database shape.
//
// Mirrors the app's user model: one `users` table with role-based columns.
// table with role-based columns. Seller onboarding fields and rider onboarding
// fields are nullable because they're filled in only during their respective
// onboarding steps.
//
// Run `pnpm db:push` (or `npm run db:push`) to apply this to Turso.

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    // Generated in JS (Node's built-in crypto) at insert time.
    .$defaultFn(() => crypto.randomUUID()),

  role: text("role", { enum: ["seller", "rider", "admin"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),

  // Stored as a hash (bcrypt/argon2) once auth moves server-side — never plaintext.
  passwordHash: text("password_hash").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),

  // --- seller onboarding (filled in at /onboarding/seller) ---
  businessName: text("business_name"),
  category: text("category"),
  pickupAddress: text("pickup_address"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  slug: text("slug").unique(),
  // Base64 data URL — store logo uploaded from settings page.
  logoDataUrl: text("logo_data_url"),

  // --- rider onboarding (filled in at /onboarding/rider) ---
  nationalId: text("national_id"),
  plateNumber: text("plate_number"),
  area: text("area"),
  // Base64 data URL for now; move to object storage when it grows.
  photoDataUrl: text("photo_data_url"),
  riderStatus: text("rider_status", {
    enum: ["pending", "approved", "suspended"],
  }),
});

// Convenience type for the row shape used across the app.
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | 'pending'      // created, no rider assigned yet
  | 'assigned'     // rider accepted the job
  | 'picked_up'    // rider collected from seller
  | 'delivered'    // rider completed delivery
  | 'cancelled'    // cancelled by seller or admin

export const orders = sqliteTable('orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  sellerId: text('seller_id')
    .notNull()
    .references(() => users.id),

  riderId: text('rider_id')
    .references(() => users.id),   // null until a rider accepts

  status: text('status', {
    enum: ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'],
  })
    .notNull()
    .default('pending'),

  // Customer info
  customerName:    text('customer_name').notNull(),
  customerPhone:   text('customer_phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),

  // Optional note from seller
  note: text('note'),

  // Timestamps (unix epoch integers)
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type Order    = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

/* ------------------------------------------------------------------ */
/* Order items                                                         */
/* ------------------------------------------------------------------ */

export const orderItems = sqliteTable('order_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  orderId: text('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),

  productName: text('product_name').notNull(),
  quantity:    integer('quantity').notNull().default(1),
  unitPrice:   integer('unit_price').notNull().default(0), // cents
})

export type OrderItem    = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert

/* ------------------------------------------------------------------ */
/* Password reset tokens                                               */
/* ------------------------------------------------------------------ */

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // SHA-256 hash of the raw token sent in the email — never store raw tokens.
  tokenHash: text('token_hash').notNull().unique(),

  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),

  usedAt: integer('used_at', { mode: 'timestamp' }),
})

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect
