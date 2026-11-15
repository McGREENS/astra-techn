export interface WelcomeSellerData {
  name: string        // first name
  email: string       // recipient address
}

export function welcomeSellerHtml({ name }: WelcomeSellerData): string {
  const firstName = name.split(' ')[0]
  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Astra</title>
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
              <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">
                Astra Technologies
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#9CB2CF;letter-spacing:0.5px;text-transform:uppercase;">
                Seller Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#0A1F44;line-height:1.3;">
                Welcome, ${firstName}.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374b66;">
                Your seller account is ready. The next step is to set up your store — this takes about two minutes and gives you a shareable order link your customers can use to place deliveries.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#374b66;">
                Once your store is live, every order triggers automatic rider dispatch and real-time status updates — so you can focus on selling, not logistics.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:8px;background:#2872A8;">
                    <a href="https://astra.com/onboarding/seller"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                      Finish setting up your store →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e8f0fb;margin:0;" />
            </td>
          </tr>

          <!-- What to expect -->
          <tr>
            <td style="padding:28px 40px 32px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;color:#9CB2CF;">
                What happens next
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td style="padding:0 0 12px;">
                    <p style="margin:0;font-size:14px;color:#374b66;line-height:1.6;">
                      <span style="font-weight:600;color:#0A1F44;">1. Set up your store</span> — add your business name, category, and pickup address.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;">
                    <p style="margin:0;font-size:14px;color:#374b66;line-height:1.6;">
                      <span style="font-weight:600;color:#0A1F44;">2. Share your link</span> — your customers use it to request deliveries directly.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#374b66;line-height:1.6;">
                      <span style="font-weight:600;color:#0A1F44;">3. We dispatch a rider</span> — automatically, within minutes of an order.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f7fb;padding:24px 40px;border-top:1px solid #e8f0fb;">
              <p style="margin:0;font-size:12px;color:#8a9ab5;line-height:1.6;">
                You're receiving this because you just created a seller account on Astra Technologies.
                If that wasn't you, you can safely ignore this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#8a9ab5;">
                © 2026 Astra Technologies
              </p>
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

export function welcomeSellerText({ name, email }: WelcomeSellerData): string {
  const firstName = name.split(' ')[0]
  return `
Welcome, ${firstName}.

Your seller account on Astra Technologies is ready.

The next step is to set up your store — this takes about two minutes and
gives you a shareable order link your customers can use to place deliveries.

Finish setting up: https://astra.com/onboarding/seller

What happens next:
  1. Set up your store — add your business name, category, and pickup address.
  2. Share your link — your customers use it to request deliveries directly.
  3. We dispatch a rider — automatically, within minutes of an order.

---
You're receiving this because you just created a seller account on Astra
Technologies (${email}). If that wasn't you, ignore this email.

© 2026 Astra Technologies
`.trim()
}
