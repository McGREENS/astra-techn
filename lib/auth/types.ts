import type { User } from '@/lib/db/schema'

/** A user row minus the password hash — the only shape safe to send to the client. */
export type SafeUser = Omit<User, 'passwordHash'>

/** Rider lifecycle status (the rider_status column, without the null). */
export type RiderStatus = 'pending' | 'approved' | 'suspended'
