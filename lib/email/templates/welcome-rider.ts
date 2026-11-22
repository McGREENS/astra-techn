import { brandEmail, brandTextFooter } from './base'

export interface WelcomeRiderData {
  name:  string
  email: string
}

export function welcomeRiderHtml({ name }: WelcomeRiderData): string {
  const firstName = name.split(' ')[0]
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return brandEmail({
    label: 'Rider Platform',
    body: `
      <p style="margin:0 0 20px;font-size:22px;font-weight:300;color:#0B0B0D;line-height:1.3;">
        Welcome, ${firstName}.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3A3D44;">
        Your rider account has been created. Submit your details — national ID,
        plate number, and a profile photo — so our team can review your application.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#3A3D44;">
        Once approved, you'll start receiving delivery requests in your area.
      </p>`,
    ctaText: 'Submit your rider details',
    ctaUrl:  `${appUrl}/onboarding/rider`,
    steps: [
      { title: 'Submit your details',       detail: 'National ID, plate number, area, and a photo.'         },
      { title: 'We review your application',detail: 'Usually within 24 hours.'                              },
      { title: 'Start accepting deliveries',detail: 'Once approved, orders come in automatically.'          },
    ],
    footerNote: `You're receiving this because you just created a rider account on
      Astra Technologies. If that wasn't you, ignore this email.`,
  })
}

export function welcomeRiderText({ name, email }: WelcomeRiderData): string {
  const firstName = name.split(' ')[0]
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `Welcome, ${firstName}.

Your rider account on Astra Technologies has been created.

Submit your details: ${appUrl}/onboarding/rider

The review process:
  1. Submit your details — national ID, plate number, area, and a photo.
  2. We review your application — usually within 24 hours.
  3. Start accepting deliveries — once approved, orders come in automatically.
${brandTextFooter(`You're receiving this because you created a rider account (${email}).`)}`
}
