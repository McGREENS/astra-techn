// Central mailer — all outbound email goes through here.
// Called only from server-side code (server actions, route handlers).
import { getTransporter } from './transport'
import {
  welcomeSellerHtml,
  welcomeSellerText,
  type WelcomeSellerData,
} from './templates/welcome-seller'
import {
  welcomeRiderHtml,
  welcomeRiderText,
  type WelcomeRiderData,
} from './templates/welcome-rider'
import {
  passwordResetHtml,
  passwordResetText,
  type PasswordResetData,
} from './templates/password-reset'

const FROM = process.env.SMTP_FROM ?? 'Astra Technologies <development@cylacon.com>'

/** Low-level send wrapper. Logs but never throws — email failures must not
 *  block account creation. */
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<void> {
  try {
    const info = await getTransporter().sendMail({ from: FROM, to, subject, html, text })
    console.log(`[email] sent to ${to} — messageId: ${info.messageId}`)
  } catch (err) {
    // Surface as a warning so signup still succeeds even if SMTP is unreachable.
    console.error(`[email] failed to send to ${to}:`, err)
  }
}

/* ---------- Welcome emails ---------- */

export async function sendWelcomeSeller(data: WelcomeSellerData): Promise<void> {
  await sendEmail({
    to: data.email,
    subject: 'Your Astra seller account is ready',
    html: welcomeSellerHtml(data),
    text: welcomeSellerText(data),
  })
}

export async function sendWelcomeRider(data: WelcomeRiderData): Promise<void> {
  await sendEmail({
    to: data.email,
    subject: "You're on the Astra rider platform",
    html: welcomeRiderHtml(data),
    text: welcomeRiderText(data),
  })
}

export async function sendPasswordReset(data: PasswordResetData): Promise<void> {
  await sendEmail({
    to: data.email,
    subject: 'Reset your Astra password',
    html: passwordResetHtml(data),
    text: passwordResetText(data),
  })
}
