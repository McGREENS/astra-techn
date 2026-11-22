// Nodemailer transport — created lazily on first use so it always reads
// env vars at runtime, not at module initialisation time. This is critical
// in serverless environments (Vercel) where the module may be imported before
// environment variables are injected.
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let _transporter: Transporter | null = null

/** Call this to force the transporter to be recreated (e.g. after env var changes in dev). */
export function resetTransporter() { _transporter = null }

export function getTransporter(): Transporter {
  // Re-use the existing instance if credentials haven't changed.
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'Missing SMTP config. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local (local) or Vercel environment variables (production).',
    )
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // mail.astra.africa uses a self-signed cert
  })

  return _transporter
}
