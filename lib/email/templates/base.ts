/**
 * Shared email base template — Astra Technologies brand guidelines.
 *
 * Brand palette:
 *   Obsidian  #0B0B0D   primary background, dark surfaces
 *   Graphite  #3A3D44   secondary text, dividers
 *   Chrome    #8D8E91   muted text, labels
 *   Silver    #C9CACD   borders, hairlines
 *   Platinum  #E9E9EA   light surface
 *   Flare     #CFD9F6   screen-only accent (not used in email)
 *
 * Rules applied:
 *   - Square corners everywhere (no border-radius)
 *   - No box-shadow
 *   - No rounded buttons
 *   - Montserrat font stack with Arial fallback
 *   - Logo: hosted PNG via NEXT_PUBLIC_APP_URL
 *   - One chrome hairline separating header from body
 *   - Obsidian header, white body, platinum footer
 */

function logoUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  // Use the black no-tagline PNG for email (brand: no-tagline in headers)
  return `${base}/Astra-Logo/PNG/astra-logo-white-no-tagline.png`
}

export interface EmailSection {
  label?: string   // e.g. "Seller Platform" — shown below logo
  body: string     // inner HTML for the body cell
  steps?: { title: string; detail: string }[]
  ctaText?: string
  ctaUrl?: string
}

export function brandEmail({
  label,
  body,
  steps,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  label:       string
  body:        string
  steps?:      { title: string; detail: string }[]
  ctaText?:    string
  ctaUrl?:     string
  footerNote:  string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const stepsHtml = steps?.length ? `
    <tr>
      <td style="padding:28px 40px 0;border-top:1px solid #E9E9EA;">
        <p style="margin:0 0 16px;font-size:11px;font-weight:600;text-transform:uppercase;
                  letter-spacing:0.6px;color:#8D8E91;">
          ${label === 'Seller Platform' ? 'What happens next' :
            label === 'Rider Platform'  ? 'The review process' :
            label === 'Delivery Partner Platform' ? 'Getting started' :
            'Next steps'}
        </p>
        ${steps.map((s, i) => `
        <p style="margin:0 0 12px;font-size:14px;color:#3A3D44;line-height:1.6;">
          <span style="font-weight:600;color:#0B0B0D;">${i + 1}. ${s.title}</span> — ${s.detail}
        </p>`).join('')}
      </td>
    </tr>` : ''

  const ctaHtml = ctaText && ctaUrl ? `
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0 0;">
          <tr>
            <td style="background:#0B0B0D;">
              <a href="${ctaUrl}"
                 style="display:inline-block;padding:14px 28px;font-size:12px;font-weight:600;
                        color:#ffffff;text-decoration:none;letter-spacing:0.5px;
                        text-transform:uppercase;">
                ${ctaText} →
              </a>
            </td>
          </tr>
        </table>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Astra Technologies</title>
</head>
<body style="margin:0;padding:0;background:#E9E9EA;
             font-family:'Montserrat',Arial,Helvetica,sans-serif;color:#0B0B0D;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background:#E9E9EA;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:560px;background:#ffffff;">

          <!-- ── Header ── -->
          <tr>
            <td style="background:#0B0B0D;padding:28px 40px;">
              <!-- Logo — white no-tagline PNG -->
              <img src="${logoUrl()}"
                   alt="Astra Technologies"
                   width="120" height="auto"
                   style="display:block;height:auto;border:0;" />
              <p style="margin:8px 0 0;font-size:10px;color:#8D8E91;
                        text-transform:uppercase;letter-spacing:0.6px;">
                ${label}
              </p>
            </td>
          </tr>

          <!-- Chrome hairline -->
          <tr>
            <td style="background:#0B0B0D;padding:0 40px;">
              <div style="border-top:1px solid #3A3D44;"></div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:36px 40px 32px;">
              ${body}
              ${ctaHtml}
            </td>
          </tr>

          ${stepsHtml}

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#F9F9FA;padding:22px 40px;border-top:1px solid #E9E9EA;">
              <p style="margin:0;font-size:11px;color:#8D8E91;line-height:1.6;">
                ${footerNote}
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#C9CACD;">
                © 2026 Astra Technologies ·
                <a href="${appUrl}" style="color:#C9CACD;text-decoration:none;">
                  astra.africa
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

/** Shared plain-text footer */
export function brandTextFooter(note: string): string {
  return `\n---\n${note}\n© 2026 Astra Technologies`
}
