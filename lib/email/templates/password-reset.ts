export interface PasswordResetData {
  name: string
  email: string
  resetUrl: string
}

export function passwordResetHtml({ name, resetUrl }: PasswordResetData): string {
  const firstName = name.split(' ')[0]
  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a2e4a;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(10,31,68,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#0A1F44;padding:32px 40px;">
              <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">Astra Technologies</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9CB2CF;letter-spacing:0.5px;text-transform:uppercase;">Password reset</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0A1F44;line-height:1.3;">
                Reset your password, ${firstName}.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374b66;">
                We received a request to reset the password for your Astra account. Click the button below to choose a new one.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#374b66;">
                This link expires in <strong>1 hour</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:8px;background:#2872A8;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                      Reset my password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:#8a9ab5;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br />
                <a href="${resetUrl}" style="color:#2872A8;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f7fb;padding:24px 40px;border-top:1px solid #e8f0fb;">
              <p style="margin:0;font-size:12px;color:#8a9ab5;line-height:1.6;">
                You're receiving this because a password reset was requested for your Astra account.
                If that wasn't you, ignore this email — no changes have been made.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#8a9ab5;">© 2026 Astra Technologies</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function passwordResetText({ name, resetUrl }: PasswordResetData): string {
  const firstName = name.split(' ')[0]
  return `
Reset your password, ${firstName}.

We received a request to reset the password for your Astra account.
Follow the link below to choose a new password. It expires in 1 hour.

${resetUrl}

If you didn't request a reset, ignore this email — your password won't change.

---
© 2026 Astra Technologies
`.trim()
}
