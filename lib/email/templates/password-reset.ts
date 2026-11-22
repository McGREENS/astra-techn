import { brandEmail, brandTextFooter } from './base'

export interface PasswordResetData {
  name:     string
  email:    string
  resetUrl: string
}

export function passwordResetHtml({ name, resetUrl }: PasswordResetData): string {
  const firstName = name.split(' ')[0]

  return brandEmail({
    label: 'Password Reset',
    body: `
      <p style="margin:0 0 20px;font-size:22px;font-weight:300;color:#0B0B0D;line-height:1.3;">
        Reset your password, ${firstName}.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3A3D44;">
        We received a request to reset the password for your Astra account.
        Click the button below to choose a new one.
      </p>
      <p style="margin:0 0 4px;font-size:15px;line-height:1.7;color:#3A3D44;">
        This link expires in <strong style="color:#0B0B0D;">1 hour</strong>.
        If you didn't request a reset, ignore this email — your password won't change.
      </p>
      <p style="margin:28px 0 0;font-size:12px;color:#8D8E91;line-height:1.6;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color:#3A3D44;word-break:break-all;">${resetUrl}</a>
      </p>`,
    ctaText: 'Reset my password',
    ctaUrl:  resetUrl,
    footerNote: `You're receiving this because a password reset was requested for your
      Astra account. If that wasn't you, ignore this email — no changes have been made.`,
  })
}

export function passwordResetText({ name, resetUrl }: PasswordResetData): string {
  const firstName = name.split(' ')[0]
  return `Reset your password, ${firstName}.

We received a request to reset the password for your Astra account.
Follow the link below — it expires in 1 hour.

${resetUrl}

If you didn't request a reset, ignore this email.
${brandTextFooter('No changes have been made to your account.')}`
}
