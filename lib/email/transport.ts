// Nodemailer transport — a module-level singleton so the SMTP connection is
// reused across server-action invocations rather than re-established every send.
import nodemailer from 'nodemailer'

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? '465', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'Missing SMTP config. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local.',
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,   // SSL on 465, STARTTLS on 587
    auth: { user, pass },
  })
}

export const transporter = createTransport()
