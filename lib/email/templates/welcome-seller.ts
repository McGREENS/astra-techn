import { brandEmail, brandTextFooter } from './base'

export interface WelcomeSellerData {
  name:  string
  email: string
}

export function welcomeSellerHtml({ name }: WelcomeSellerData): string {
  const firstName = name.split(' ')[0]
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://astra.africa/'

  return brandEmail({
    label: 'Seller Platform',
    body: `
      <p style="margin:0 0 20px;font-size:22px;font-weight:300;color:#0B0B0D;line-height:1.3;">
        Welcome, ${firstName}.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3A3D44;">
        Your seller account is ready. Set up your store in two minutes and
        get a shareable order link your customers can use to place deliveries.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#3A3D44;">
        Every order triggers automatic rider dispatch and real-time updates —
        so you can focus on selling, not logistics.
      </p>`,
    ctaText: 'Finish setting up your store',
    ctaUrl:  `${appUrl}/onboarding/seller`,
    steps: [
      { title: 'Set up your store',  detail: 'Add your business name, category, and pickup address.' },
      { title: 'Share your link',    detail: 'Your customers use it to request deliveries directly.'  },
      { title: 'We dispatch a rider',detail: 'Automatically, within minutes of an order.'             },
    ],
    footerNote: `You're receiving this because you just created a seller account on
      Astra Technologies. If that wasn't you, ignore this email.`,
  })
}

export function welcomeSellerText({ name, email }: WelcomeSellerData): string {
  const firstName = name.split(' ')[0]
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://astra.africa/'
  return `Welcome, ${firstName}.

Your seller account on Astra Technologies is ready.

Set up your store: ${appUrl}/onboarding/seller

What happens next:
  1. Set up your store — add your business name, category, and pickup address.
  2. Share your link — your customers use it to request deliveries directly.
  3. We dispatch a rider — automatically, within minutes of an order.
${brandTextFooter(`You're receiving this because you created a seller account (${email}).`)}`
}
