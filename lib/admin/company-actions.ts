'use server'

import { eq } from 'drizzle-orm'
import { randomBytes } from 'node:crypto'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import type { User } from '@/lib/db/schema'
import { hashPassword } from '@/lib/auth/password'
import { getTransporter } from '@/lib/email/transport'
import { brandEmail, brandTextFooter } from '@/lib/email/templates/base'
import type { SafeUser } from '@/lib/auth/types'

function sanitize(u: User): SafeUser {
  const { passwordHash, ...rest } = u
  return rest
}

/** Generate a readable temporary password: 3 words + 4 digits */
function generateTempPassword(): string {
  const words  = ['Deliver', 'Rider', 'Route', 'Swift', 'Track', 'Fleet', 'Cargo', 'Astra']
  const word   = words[Math.floor(Math.random() * words.length)]
  const digits = String(Math.floor(1000 + Math.random() * 9000))
  const suffix = randomBytes(2).toString('hex').toUpperCase()
  return `${word}${digits}${suffix}`
}

/* ------------------------------------------------------------------ */
/* Get all delivery companies                                          */
/* ------------------------------------------------------------------ */

export async function getDeliveryCompanies(): Promise<SafeUser[]> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.role, 'delivery_company'))
  return rows.map(sanitize)
}

/* ------------------------------------------------------------------ */
/* Create a delivery company account                                  */
/* ------------------------------------------------------------------ */

export interface CreateCompanyInput {
  companyName: string   // stored as users.businessName
  contactName: string   // stored as users.name
  email:       string
  phone?:      string
}

export type CreateCompanyResult =
  | { ok: true;  company: SafeUser; tempPassword: string; emailSent: boolean }
  | { ok: false; error: string }

export async function createDeliveryCompany(
  input: CreateCompanyInput,
): Promise<CreateCompanyResult> {
  const email = input.email.trim().toLowerCase()

  // Check email not already taken
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  if (existing) return { ok: false, error: 'This email is already registered.' }

  const tempPassword = generateTempPassword()
  const passwordHash = await hashPassword(tempPassword)

  const [created] = await db
    .insert(users)
    .values({
      name:         input.contactName.trim(),
      email,
      phone:        input.phone?.trim() || null,
      passwordHash,
      role:         'delivery_company',
      businessName: input.companyName.trim(),
    })
    .returning()

  if (!created) return { ok: false, error: 'Could not create account.' }

  // Send credentials email — non-fatal. The account exists regardless.
  // If email fails, the admin sees the credentials in the confirmation UI
  // and can share them manually.
  let emailSent = true
  try {
    await sendCompanyCredentials({
      to:            email,
      companyName:   input.companyName,
      contactName:   input.contactName,
      tempPassword,
    })
  } catch (err) {
    console.error('[company] credentials email failed:', err)
    emailSent = false
  }

  return {
    ok: true,
    company: sanitize(created),
    tempPassword,
    emailSent,
  }
}

/* ------------------------------------------------------------------ */
/* Credentials email                                                   */
/* ------------------------------------------------------------------ */

async function sendCompanyCredentials({
  to, companyName, contactName, tempPassword,
}: {
  to: string; companyName: string; contactName: string; tempPassword: string
}) {
  const FROM     = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'contact@astra.africa'
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const loginUrl = `${appUrl}/login`
  const firstName = contactName.split(' ')[0]

  const credentialsTable = `
    <table cellpadding="0" cellspacing="0" role="presentation" width="100%"
           style="border:1px solid #E9E9EA;margin:24px 0;">
      <tr>
        <td style="padding:10px 16px;background:#F9F9FA;font-size:11px;font-weight:600;
                   color:#8D8E91;text-transform:uppercase;letter-spacing:0.4px;
                   border-bottom:1px solid #E9E9EA;width:100px;">Email</td>
        <td style="padding:10px 16px;font-size:14px;color:#0B0B0D;
                   border-bottom:1px solid #E9E9EA;">${to}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;background:#F9F9FA;font-size:11px;font-weight:600;
                   color:#8D8E91;text-transform:uppercase;letter-spacing:0.4px;">Password</td>
        <td style="padding:10px 16px;font-size:14px;font-weight:600;
                   color:#0B0B0D;font-family:monospace;letter-spacing:1px;">${tempPassword}</td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#8D8E91;">
      Change your password after your first login.
      This credential was generated by Astra and is not stored in plain text.
    </p>`

  const html = brandEmail({
    label:   'Delivery Partner Platform',
    body:    `
      <p style="margin:0 0 20px;font-size:22px;font-weight:300;color:#0B0B0D;line-height:1.3;">
        Welcome, ${firstName}.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3A3D44;">
        Your delivery company account for <strong style="color:#0B0B0D;">${companyName}</strong>
        has been created. Log in to start managing your rider fleet.
      </p>
      ${credentialsTable}`,
    ctaText: 'Log in to your dashboard',
    ctaUrl:  loginUrl,
    steps: [
      { title: 'Log in',           detail: `Use the credentials above at ${loginUrl}.`     },
      { title: 'Change password',  detail: 'Update your password from account settings.'   },
      { title: 'Register riders',  detail: 'Add your rider fleet from the company dashboard.' },
    ],
    footerNote: `You're receiving this because an Astra Technologies admin created a
      delivery partner account for ${companyName}. If this was unexpected, reply to this email.`,
  })

  const text = `Welcome to Astra Technologies, ${firstName}.

Your delivery company account for ${companyName} has been created.

Login credentials:
  Email:    ${to}
  Password: ${tempPassword}

Change your password after your first login.
Log in: ${loginUrl}

${brandTextFooter(`Account created for ${companyName}.`)}`

  const transporter = getTransporter()
  await transporter.sendMail({
    from:    FROM,
    to,
    subject: `Your Astra delivery partner account — ${companyName}`,
    html,
    text,
  })
}
