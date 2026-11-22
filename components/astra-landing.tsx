'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight, Bike, Check, ChevronDown, Clock3, Link2,
  MapPin, Menu, MessageCircle, PackageCheck, QrCode,
  ShieldCheck, Truck, UserRound, X, Zap,
} from 'lucide-react'
import { submitContactForm } from '@/lib/contact/actions'

/* ------------------------------------------------------------------ */
/* Brand colours                                                       */
/* ------------------------------------------------------------------ */
// Obsidian #0B0B0D · Graphite #3A3D44 · Chrome #8D8E91
// Silver #C9CACD · Platinum #E9E9EA · Flare #CFD9F6

function Logo({ light = false, silver = false }: { light?: boolean; silver?: boolean }) {
  const src = silver
    ? '/Astra-Logo/SVG/astra-logo-silver-no-tagline.svg'
    : light
      ? '/Astra-Logo/SVG/astra-logo-white-no-tagline.svg'
      : '/Astra-Logo/SVG/astra-logo-black-no-tagline.svg'
  return (
    <a href="#top" className="inline-flex shrink-0 items-center" aria-label="Astra Technologies">
      <Image
        src={src}
        alt="Astra Technologies"
        width={120}
        height={28}
        style={{ height: 28, width: 'auto' }}
        priority
      />
    </a>
  )
}

function Btn({
  children,
  outline = false,
  href = '/get-started',
}: {
  children: React.ReactNode
  outline?: boolean
  href?: string
}) {
  return (
    <a
      href={href}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3',
        'text-xs font-medium uppercase tracking-widest transition hover:-translate-y-0.5',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CFD9F6]',
        outline
          ? 'border border-white/30 text-white hover:bg-white/10'
          : 'bg-[#0B0B0D] text-white hover:bg-[#3A3D44]',
      ].join(' ')}
    >
      {children}
    </a>
  )
}

const steps = [
  ['01', Link2,        'Share your order link',    'Add your Astra link to your bio, status, or next post.'],
  ['02', MapPin,       'Customer places an order',  'They choose items, enter details, and confirm delivery address.'],
  ['03', Bike,         'A rider is assigned',       'The right rider gets clear pickup and drop-off details.'],
  ['04', PackageCheck, 'Delivery is confirmed',     'Live updates keep everyone in sync until delivery.'],
] as const

const features = [
  ['One link per seller',  'A checkout your customers can actually use.',           Link2],
  ['Instant dispatch',     'Match every order with a real person nearby.',          Bike],
  ['Pin-perfect drop-offs','Give customers and riders confidence at the door.',     MapPin],
  ['Automatic updates',    'Keep customers informed from order to doorstep.',       MessageCircle],
  ['Secure handoff',       'A simple code that keeps orders safe.',                 ShieldCheck],
  ['Order dashboard',      'Every order, every rider, every status in one place.',  QrCode],
] as const

function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[510px] w-[260px] sm:h-[560px] sm:w-[285px]">
      {/* Floating status card */}
      <div className="absolute -left-16 top-28 hidden w-48 -rotate-6 rounded-sm border border-[#C9CACD] bg-white p-4 text-[#0B0B0D] shadow-xl sm:block">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#3A3D44]" /> On the way
          </span>
          <Truck size={13} />
        </div>
        <p className="text-[11px] text-[#8D8E91]">Rider is 4 mins away</p>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium">
          <span className="rounded-sm border border-[#E9E9EA] bg-[#F9F9FA] px-2 py-1">AST-482</span>
          <span className="text-[#8D8E91]">Delivery code</span>
        </div>
      </div>

      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[38px] border-[7px] border-[#0B0B0D] bg-white p-2 shadow-[0_30px_80px_rgba(0,0,0,.35)]">
        <div className="h-full overflow-hidden rounded-[29px] bg-[#F9F9FA]">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <span className="text-[10px] font-medium text-[#0B0B0D]">9:41</span>
            <div className="flex gap-1">
              <span className="h-2 w-3 rounded-sm bg-[#0B0B0D]" />
              <span className="h-2 w-2 rounded-full bg-[#0B0B0D]" />
            </div>
          </div>

          {/* Store header */}
          <div className="border-b border-[#E9E9EA] bg-white px-5 pb-4 pt-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-sm bg-[#0B0B0D] text-white text-[10px] font-bold">A</span>
              <span className="text-sm font-medium text-[#0B0B0D]">Mina&apos;s Closet</span>
            </div>
            <p className="text-[10px] text-[#8D8E91]">Curated pieces, delivered today</p>
          </div>

          {/* Order items */}
          <div className="px-5 py-4">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#0B0B0D]">Your order</p>
            {[['Linen set', '$42'], ['Canvas tote', '$18']].map(([name, price]) => (
              <div key={name} className="mb-2 flex items-center justify-between rounded-sm border border-[#E9E9EA] bg-white p-3">
                <div>
                  <div className="mb-1 h-1.5 w-14 rounded-sm bg-[#E9E9EA]" />
                  <span className="text-[10px] text-[#8D8E91]">{name}</span>
                </div>
                <span className="text-[11px] font-medium text-[#0B0B0D]">{price}</span>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="relative mt-4 h-28 overflow-hidden rounded-sm bg-[#E9E9EA]">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(30deg, transparent 48%, #C9CACD 49%, transparent 51%), linear-gradient(120deg, transparent 48%, #fff 49%, transparent 51%)',
                  backgroundSize: '36px 36px',
                }}
              />
              <div className="absolute left-[54%] top-[45%] grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#0B0B0D] text-white shadow-lg">
                <MapPin size={13} fill="currentColor" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-[#8D8E91]">Delivery to</span>
              <span className="text-[10px] font-medium text-[#0B0B0D]">Add location</span>
            </div>
            <button className="mt-4 w-full rounded-sm bg-[#0B0B0D] py-3 text-[11px] font-medium uppercase tracking-widest text-white">
              Place order <ArrowRight className="ml-1 inline" size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Contact form for delivery company enquiries                        */
/* ------------------------------------------------------------------ */

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('submitting')
    const data = new FormData(e.currentTarget)
    const res = await submitContactForm({
      name:        String(data.get('name') ?? ''),
      contact:     String(data.get('contact') ?? ''),
      companyName: String(data.get('companyName') ?? ''),
      message:     String(data.get('message') ?? ''),
    })
    if (res.ok) {
      setStatus('done')
    } else {
      setErrorMsg(res.error)
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center border border-[#3A3D44] p-7 text-center">
        <div className="mb-4 grid size-12 place-items-center border border-[#3A3D44] text-[#C9CACD]">
          <Check size={20} />
        </div>
        <h3 className="text-xl font-light text-white">Enquiry received.</h3>
        <p className="mt-2 text-sm text-[#8D8E91]">
          Our team will review your application and be in touch shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#3A3D44] p-5 sm:p-7">
      {status === 'error' && (
        <p className="mb-4 border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </p>
      )}
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
            Your name <span className="text-red-500">*</span>
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Jon Brewster"
              className="border border-[#3A3D44] bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#3A3D44] focus:border-[#C9CACD]"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
            Phone or email <span className="text-red-500">*</span>
            <input
              name="contact"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="border border-[#3A3D44] bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#3A3D44] focus:border-[#C9CACD]"
            />
          </label>
        </div>
        <label className="grid gap-1.5 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
          Company name <span className="text-red-500">*</span>
          <input
            name="companyName"
            required
            autoComplete="organization"
            placeholder="Swift Logistics Ltd."
            className="border border-[#3A3D44] bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#3A3D44] focus:border-[#C9CACD]"
          />
        </label>
        <label className="grid gap-1.5 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
          Message <span className="text-[#3A3D44] font-normal normal-case tracking-normal">— optional</span>
          <textarea
            name="message"
            rows={3}
            placeholder="Fleet size, operating area, anything else we should know…"
            className="resize-none border border-[#3A3D44] bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#3A3D44] focus:border-[#C9CACD]"
          />
        </label>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="mt-1 flex items-center justify-center gap-2 border border-[#C9CACD] bg-white py-3.5 text-xs font-medium uppercase tracking-widest text-[#0B0B0D] transition hover:bg-[#E9E9EA] disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : <>Submit enquiry <ArrowRight size={13} /></>}
        </button>
        <p className="text-center text-[11px] text-[#3A3D44]">
          We respond to all enquiries within 48 hours.
        </p>
      </div>
    </form>
  )
}

export default function AstraLanding() {
  const [menu, setMenu]       = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs: [string, string][] = [
    ['Do I need to code?', 'No. Astra gives you a ready-to-share order link. Add your items, share the link, and start accepting delivery orders.'],
    ['Which cities are supported?', 'We are starting with select cities and expanding with our rider network. Join the waitlist to hear when Astra reaches yours.'],
    ['How do customers pay?', 'Customers confirm payment with the seller at delivery. More built-in payment options are coming soon.'],
    ['How are riders assigned?', 'Astra matches each order with available riders based on pickup location, drop-off, and delivery timing.'],
    ["Is my customers' data safe?", 'Yes. We keep customer details limited to what is needed for delivery and protect them with secure access controls.'],
  ]

  return (
    <main id="top" className="overflow-hidden bg-white text-[#0B0B0D]">

      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-[#3A3D44] bg-[#0B0B0D]">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 lg:px-16">
          <Logo silver />
          <div className="hidden items-center gap-8 text-xs font-medium uppercase tracking-widest text-[#8D8E91] md:flex">
            <a className="transition hover:text-[#C9CACD]" href="#how">How it works</a>
            <a className="transition hover:text-[#C9CACD]" href="#features">Features</a>
            <a className="transition hover:text-[#C9CACD]" href="#sides">For riders</a>
            <a className="transition hover:text-[#C9CACD]" href="#faq">FAQ</a>
          </div>
          <div className="hidden md:block"><Btn outline>Get your order link <ArrowRight size={13} /></Btn></div>
          <button aria-label="Toggle menu" onClick={() => setMenu(!menu)} className="rounded-sm p-2 text-[#C9CACD] md:hidden">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {menu && (
          <div className="mx-4 mb-2 rounded-sm border border-[#3A3D44] bg-[#0B0B0D] p-4 text-white shadow-xl md:hidden">
            <div className="grid gap-4 p-2 text-xs uppercase tracking-widest">
              <a href="#how"      onClick={() => setMenu(false)}>How it works</a>
              <a href="#features" onClick={() => setMenu(false)}>Features</a>
              <a href="#sides"    onClick={() => setMenu(false)}>For riders</a>
              <a href="#faq"      onClick={() => setMenu(false)}>FAQ</a>
              <Btn>Get started</Btn>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="hero-grid relative bg-[#F9F9FA]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-16 pt-28 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:pb-24 lg:pt-32">
          <div className="relative z-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#8D8E91]">
              Astra Technologies
            </p>
            <h1 className="max-w-2xl text-[40px] font-light leading-[1.06] tracking-[-0.04em] sm:text-[54px] lg:text-[62px]">
              Turn every Instagram and TikTok post into a{' '}
              <span className="font-medium">delivery-ready order.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#8D8E91]">
              One order link, instant rider dispatch, and automatic updates — so you sell more and chase less.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn>Get your order link <ArrowRight size={13} /></Btn>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#C9CACD] bg-white px-5 py-3 text-xs font-medium uppercase tracking-widest text-[#0B0B0D] transition hover:-translate-y-0.5 hover:border-[#8D8E91]"
              >
                See how it works
              </a>
            </div>
            <div className="mt-9 flex items-center gap-3 text-xs text-[#8D8E91]">
              <div className="flex -space-x-1.5">
                {[UserRound, Bike, PackageCheck].map((Icon, i) => (
                  <span key={i} className="grid size-7 place-items-center rounded-sm border border-[#C9CACD] bg-[#F9F9FA] text-[#0B0B0D]">
                    <Icon size={12} />
                  </span>
                ))}
              </div>
              Built for the way you already sell
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* ── Pain points banner ── */}
      <section className="border-y border-[#E9E9EA] bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-4 px-5 py-8 sm:grid-cols-3 lg:px-16">
          {[
            [MessageCircle, 'Orders get lost in DMs.'],
            [Clock3,        'Customers keep asking where it is.'],
            [MessageCircle, 'Riders and sellers call back and forth.'],
          ].map(([Icon, text]) => (
            <div key={text as string} className="flex items-center gap-3 text-sm text-[#8D8E91]">
              <Icon size={15} className="shrink-0 text-[#C9CACD]" />
              {text as string}
            </div>
          ))}
        </div>
        <div className="border-t border-[#E9E9EA] bg-[#0B0B0D] py-3 text-center text-xs font-medium uppercase tracking-widest text-[#C9CACD]">
          Astra solves all three <ArrowRight className="ml-1 inline" size={12} />
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="mx-auto max-w-[1200px] px-5 py-20 lg:px-16 lg:py-28">
        <div className="mb-12 max-w-xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[.2em] text-[#8D8E91]">How it works</p>
          <h2 className="text-3xl font-light tracking-[-0.04em] sm:text-5xl">
            From post to doorstep, without the back-and-forth.
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-4">
          {steps.map(([num, Icon, title, copy], i) => (
            <div className="relative" key={num}>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-sm border border-[#E9E9EA] bg-[#F9F9FA] text-[#0B0B0D]">
                  <Icon size={16} />
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#C9CACD]">{num}</span>
              </div>
              <h3 className="mb-2 font-medium">{title}</h3>
              <p className="text-sm leading-6 text-[#8D8E91]">{copy}</p>
              {i < 3 && (
                <div className="absolute left-12 top-5 hidden h-px w-[calc(100%-48px)] bg-[#E9E9EA] md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-[#F9F9FA] py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-16">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[.2em] text-[#8D8E91]">Everything in one place</p>
              <h2 className="text-3xl font-light tracking-[-0.04em] sm:text-5xl">A calmer way to deliver.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#8D8E91]">
              The tools to turn social attention into repeatable delivery.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, copy, Icon]) => (
              <div
                key={title}
                className="rounded-sm border border-[#E9E9EA] bg-white p-6 transition hover:-translate-y-1"
              >
                <div className="mb-8 grid size-10 place-items-center rounded-sm border border-[#E9E9EA] text-[#0B0B0D]">
                  <Icon size={16} />
                </div>
                <h3 className="mb-2 font-medium">{title}</h3>
                <p className="text-sm leading-6 text-[#8D8E91]">{copy}</p>
              </div>
            ))}

            {/* Dashboard preview — wide card */}
            <div className="rounded-sm border border-[#3A3D44] bg-[#0B0B0D] p-6 text-white sm:col-span-2 lg:col-span-3">
              <div className="flex flex-col justify-between gap-8 lg:flex-row">
                <div className="max-w-xs">
                  <div className="mb-6 grid size-10 place-items-center rounded-sm border border-[#3A3D44] text-[#C9CACD]">
                    <QrCode size={16} />
                  </div>
                  <h3 className="mb-2 text-xl font-medium">One link. A whole delivery desk.</h3>
                  <p className="text-sm leading-6 text-[#8D8E91]">Every order, every rider, every status in one place.</p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-sm border border-[#3A3D44] px-3 py-2 text-xs text-[#8D8E91]">
                    Built for social sellers
                  </div>
                </div>

                {/* Mini dashboard table */}
                <div className="w-full max-w-2xl rounded-sm border border-[#E9E9EA] bg-white p-4 text-[#0B0B0D] sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#8D8E91]">Today</p>
                      <p className="font-medium">Orders overview</p>
                    </div>
                    <span className="rounded-sm border border-[#E9E9EA] px-3 py-1.5 text-xs font-medium">Export</span>
                  </div>
                  <div className="hidden grid-cols-[1.3fr_1fr_1fr_1fr] gap-3 border-b border-[#E9E9EA] pb-3 text-[10px] font-medium uppercase tracking-widest text-[#8D8E91] sm:grid">
                    <span>Order</span><span>Customer</span><span>Amount</span><span>Status</span>
                  </div>
                  {[
                    ['#AST-1024', 'Amina K.', '$60', 'Placed'],
                    ['#AST-1023', 'Jon B.',   '$42', 'Assigned'],
                    ['#AST-1022', 'Leila M.', '$80', 'Picked up'],
                    ['#AST-1021', 'David O.', '$35', 'Delivered'],
                  ].map(([a, b, c, d]) => (
                    <div key={a} className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#E9E9EA] py-3 text-xs last:border-0 sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:items-center">
                      <span className="font-medium">
                        {a}
                        <small className="block font-normal text-[#8D8E91] sm:hidden">{b}</small>
                      </span>
                      <span className="hidden text-[#8D8E91] sm:block">{b}</span>
                      <span className="hidden font-medium sm:block">{c}</span>
                      <span className={`justify-self-end rounded-sm px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${d === 'Delivered' ? 'bg-[#E9E9EA] text-[#3A3D44]' : 'bg-[#0B0B0D] text-[#C9CACD]'}`}>
                        {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For both sides ── */}
      <section id="sides" className="mx-auto max-w-[1200px] px-5 py-20 lg:px-16 lg:py-28">
        <div className="mb-12 max-w-lg">
          <p className="mb-3 text-xs font-medium uppercase tracking-[.2em] text-[#8D8E91]">One network, two wins</p>
          <h2 className="text-3xl font-light tracking-[-0.04em] sm:text-5xl">Built for both sides.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-sm border border-[#E9E9EA] bg-[#F9F9FA] p-8">
            <div className="mb-10 grid size-12 place-items-center rounded-sm border border-[#E9E9EA] bg-white text-[#0B0B0D]">
              <UserRound size={20} />
            </div>
            <h3 className="mb-5 text-2xl font-light">For sellers</h3>
            {[
              'One link to accept orders anywhere',
              'Automatic updates that reduce support messages',
              'A clearer view of every delivery',
            ].map((x) => (
              <p key={x} className="mb-4 flex items-center gap-3 text-sm text-[#8D8E91]">
                <Check size={13} className="shrink-0 text-[#3A3D44]" />{x}
              </p>
            ))}
          </div>
          <div className="rounded-sm border border-[#3A3D44] bg-[#0B0B0D] p-8 text-white">
            <div className="mb-10 grid size-12 place-items-center rounded-sm border border-[#3A3D44] bg-[#3A3D44] text-[#C9CACD]">
              <Bike size={20} />
            </div>
            <h3 className="mb-5 text-2xl font-light">For riders</h3>
            {[
              'Steady delivery jobs in your area',
              'Clear pickup and drop-off details',
              'A simple mobile page that keeps you moving',
            ].map((x) => (
              <p key={x} className="mb-4 flex items-center gap-3 text-sm text-[#8D8E91]">
                <Check size={13} className="shrink-0 text-[#8D8E91]" />{x}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing placeholder ── */}
      <section className="bg-[#F9F9FA] py-20">
        <div className="mx-auto max-w-[720px] px-5 text-center">
          <div className="mx-auto mb-5 grid size-12 place-items-center rounded-sm border border-[#E9E9EA] text-[#0B0B0D]">
            <Zap size={16} />
          </div>
          <h2 className="text-3xl font-light tracking-[-0.04em] sm:text-4xl">Simple pricing for businesses.</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-[#8D8E91]">
            A small fee keeps your delivery link active. Pricing details are coming soon.
          </p>
          <div className="mt-6"><Btn>Get early access <ArrowRight size={13} /></Btn></div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-[800px] px-5 py-20 lg:py-28">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[.2em] text-[#8D8E91]">Questions, answered</p>
          <h2 className="text-3xl font-light tracking-[-0.04em] sm:text-5xl">The details.</h2>
        </div>
        <div className="divide-y divide-[#E9E9EA] border-y border-[#E9E9EA]">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button
                className="flex w-full items-center justify-between py-5 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-[#CFD9F6]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {q}
                <ChevronDown size={16} className={`shrink-0 transition ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="-mt-2 pb-5 pr-10 text-sm leading-6 text-[#8D8E91]">{a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Waitlist / CTA ── */}
      <section id="waitlist" className="bg-[#0B0B0D] py-20 text-white lg:py-24">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 lg:grid-cols-[.9fr_1.1fr] lg:px-16">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[.2em] text-[#8D8E91]">Partner with us</p>
            <h2 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl">Are you a delivery company?</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#8D8E91]">
              We&apos;re partnering with delivery companies to power last-mile logistics for social sellers.
              Fill in your details and our team will be in touch.
            </p>
            <div className="mt-8 flex gap-4 text-xs font-medium uppercase tracking-widest text-[#3A3D44]">
              <span>Innovate</span><span>·</span><span>Connect</span><span>·</span><span>Grow</span>
            </div>
          </div>

          {/* Contact form */}
          <ContactForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0B0B0D] py-10 text-white">
        {/* Chrome hairline */}
        <div className="mx-auto mb-8 max-w-[1200px] border-t border-[#8D8E91]/20 px-5 lg:px-16" />
        <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-8 px-5 sm:flex-row sm:items-end lg:px-16">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm text-[#8D8E91]">
              The delivery layer for the social commerce era.
            </p>
          </div>
          <div className="flex items-end justify-between gap-8 sm:flex-col sm:items-end">
            <div className="flex gap-5 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
              <a href="#how"      className="hover:text-[#C9CACD] transition">How it works</a>
              <a href="#features" className="hover:text-[#C9CACD] transition">Features</a>
              <a href="#faq"      className="hover:text-[#C9CACD] transition">FAQ</a>
              <a href="/get-started" className="hover:text-[#C9CACD] transition">Join</a>
            </div>
            <p className="text-xs text-[#3A3D44]">© 2026 Astra Technologies</p>
          </div>
        </div>
      </footer>

    </main>
  )
}
