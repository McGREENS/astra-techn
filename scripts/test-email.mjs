// Tests SMTP connectivity and sends a sample welcome email to the sender
// address itself so you can verify it arrives and check the layout.
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('ERR Missing SMTP env vars — check .env.local')
  process.exit(1)
}

const port = parseInt(SMTP_PORT ?? '465', 10)
const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
})

// 1) Verify the connection
try {
  await transport.verify()
  console.log('STEP1_VERIFY_OK — SMTP connection and credentials accepted')
} catch (e) {
  console.error('STEP1_VERIFY_ERR — ' + e.message)
  process.exit(1)
}

// 2) Send a test email to the sender address itself
const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f7fb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(10,31,68,0.07);">
        <tr>
          <td style="background:#0A1F44;padding:32px 40px;">
            <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">Astra Technologies</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9CB2CF;letter-spacing:0.5px;text-transform:uppercase;">Email test</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0A1F44;">SMTP test successful.</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374b66;">
              This is a test email from the Astra development environment. If you're reading this,
              the SMTP connection to <strong>${SMTP_HOST}:${port}</strong> is working correctly.
            </p>
            <p style="margin:0;font-size:14px;color:#8a9ab5;">This email was sent at ${new Date().toUTCString()}.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f4f7fb;padding:24px 40px;border-top:1px solid #e8f0fb;">
            <p style="margin:0;font-size:12px;color:#8a9ab5;">© 2026 Astra Technologies — automated test, no action required.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`

try {
  const info = await transport.sendMail({
    from: SMTP_FROM ?? SMTP_USER,
    to: SMTP_USER, // send to self
    subject: '[Astra] SMTP test — ' + new Date().toISOString().slice(0, 16),
    html,
    text: `SMTP test successful. Connection to ${SMTP_HOST}:${port} is working. Sent at ${new Date().toUTCString()}.`,
  })
  console.log('STEP2_SEND_OK — messageId: ' + info.messageId)
  console.log(`STEP2_SEND_OK — check the inbox at ${SMTP_USER}`)
} catch (e) {
  console.error('STEP2_SEND_ERR — ' + e.message)
  process.exit(1)
}

console.log('DONE')
