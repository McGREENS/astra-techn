'use server'

import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contactEnquiries } from '@/lib/db/schema'
import type { ContactEnquiry } from '@/lib/db/schema'
import { getTransporter } from '@/lib/email/transport'
import { brandEmail, brandTextFooter } from '@/lib/email/templates/base'

export type { ContactEnquiry }

export interface ContactFormInput {
  name:        string
  contact:     string   // phone or email
  companyName: string
  message?:    string
}

export type ContactResult = { ok: true } | { ok: false; error: string }

/* ------------------------------------------------------------------ */
/* Submit a contact enquiry                                            */
/* ------------------------------------------------------------------ */

export async function submitContactForm(
  input: ContactFormInput,
): Promise<ContactResult> {
  const { name, contact, companyName, message } = input

  if (!name.trim() || !contact.trim() || !companyName.trim()) {
    return { ok: false, error: 'Please fill in all required fields.' }
  }

  // 1. Persist to DB — this is the source of truth for the admin dashboard
  await db.insert(contactEnquiries).values({
    name:        name.trim(),
    contact:     contact.trim(),
    companyName: companyName.trim(),
    message:     message?.trim() || null,
  })

  // 2. Send a notification email to the team (fire-and-forget is OK here
  //    because the submission is already safely in the DB)
  const FROM = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'contact@astra.africa'
  const TO   = process.env.SMTP_USER ?? 'contact@astra.africa'

  const isEmail  = contact.includes('@')
  const replyTo  = isEmail ? contact.trim() : undefined

  const tableRows = [
    ['Company', companyName],
    ['Name',    name],
    [isEmail ? 'Email' : 'Phone', contact],
    ...(message?.trim() ? [['Message', message]] : []),
  ].map(([label, value]) => `
    <tr>
      <td style="padding:10px 16px;background:#F9F9FA;font-size:11px;font-weight:600;
                 color:#8D8E91;text-transform:uppercase;letter-spacing:0.4px;
                 border-bottom:1px solid #E9E9EA;width:110px;vertical-align:top;">${label}</td>
      <td style="padding:10px 16px;font-size:14px;color:#0B0B0D;
                 border-bottom:1px solid #E9E9EA;">${value}</td>
    </tr>`).join('')

  const html = brandEmail({
    label: 'New Delivery Partner Enquiry',
    body:  `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3A3D44;">
        A delivery company has submitted an enquiry through the website.
      </p>
      <table cellpadding="0" cellspacing="0" role="presentation" width="100%"
             style="border:1px solid #E9E9EA;border-collapse:collapse;">
        ${tableRows}
      </table>
      ${isEmail ? `<p style="margin:16px 0 0;font-size:13px;color:#8D8E91;">
        Reply directly to this email to respond to the applicant.
      </p>` : ''}`,
    footerNote: 'Submitted via astra.africa — view all enquiries in the admin dashboard.',
  })

  const text = [
    'New delivery partner enquiry — Astra Technologies',
    '',
    `Company: ${companyName}`,
    `Name:    ${name}`,
    `${isEmail ? 'Email' : 'Phone'}: ${contact}`,
    ...(message?.trim() ? [`Message: ${message}`] : []),
    '',
    brandTextFooter('View all enquiries in the admin dashboard.'),
  ].join('\n')

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from:    FROM,
      to:      TO,
      ...(replyTo ? { replyTo } : {}),
      subject: `New delivery partner enquiry — ${companyName}`,
      html,
      text,
    })
  } catch (err) {
    // Email failure is non-fatal — the submission is already in the DB
    console.error('[contact] notification email failed:', err)
  }

  return { ok: true }
}

/* ------------------------------------------------------------------ */
/* Admin: list all enquiries                                           */
/* ------------------------------------------------------------------ */

export async function getContactEnquiries(): Promise<ContactEnquiry[]> {
  return db
    .select()
    .from(contactEnquiries)
    .orderBy(desc(contactEnquiries.createdAt))
}

/* ------------------------------------------------------------------ */
/* Admin: update enquiry status                                        */
/* ------------------------------------------------------------------ */

export async function updateEnquiryStatus(
  id: string,
  status: 'new' | 'contacted' | 'dismissed',
): Promise<void> {
  await db
    .update(contactEnquiries)
    .set({ status })
    .where(eq(contactEnquiries.id, id))
}
