/**
 * Returns the base URL for the current environment.
 *
 * Priority:
 *   1. NEXT_PUBLIC_APP_URL  — set in .env.local for local dev, in Vercel env vars for production
 *   2. http://localhost:3000 — fallback for local dev when the var isn't set
 *
 * Usage:
 *   siteUrl()              → "http://localhost:3000"  (local)
 *   siteUrl()              → "https://astra.africa"   (production)
 *   siteUrl('/s/my-store') → "https://astra.africa/s/my-store"
 */
export function siteUrl(path = ''): string {
  const base =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) ||
    'http://localhost:3000'
  return base.replace(/\/$/, '') + (path ? '/' + path.replace(/^\//, '') : '')
}

/** The display domain shown in the UI (e.g. "astra.africa/s/slug"). */
export function displayUrl(path = ''): string {
  const base = siteUrl(path)
  try {
    const u = new URL(base)
    return u.host + u.pathname
  } catch {
    return base
  }
}
