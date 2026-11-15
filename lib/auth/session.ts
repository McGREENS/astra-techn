// Server-side session management: a signed JWT stored in an http-only cookie.
// Uses `jose` (pure JS) so it works without the Visual C++ Runtime on Windows.
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'astra_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days
const ALG = 'HS256'

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set. Add it to .env.local.')
  return new TextEncoder().encode(secret)
}

/** Issue a signed session cookie for the given user id. */
export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret())
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** Verify the session cookie and return the user id, or null when invalid/absent. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] })
    return payload.sub ?? null
  } catch {
    return null
  }
}
