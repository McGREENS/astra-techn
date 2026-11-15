'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
  Link2,
  MapPin,
  Settings,
  Store,
  Tag,
} from 'lucide-react'

import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Field } from '@/components/auth/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SubmitButton } from '@/components/auth/submit-button'
import { updateSellerSettings } from '@/lib/seller/actions'
import { useAuth } from '@/components/auth/auth-provider'
import { fileToResizedDataUrl } from '@/lib/image'
import type { NavItem } from '@/components/dashboard/sidebar'

/* ------------------------------------------------------------------ */

const CATEGORIES = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Bakery',
  'Handmade & Crafts',
  'Electronics & Accessories',
  'Home & Living',
  'Other',
] as const

const schema = z.object({
  businessName:  z.string().min(2, 'Enter your business name'),
  category:      z.string().min(1, 'Select a category'),
  pickupAddress: z.string().min(5, 'Enter your pickup address'),
  instagram:     z.string().optional(),
  tiktok:        z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const SELLER_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',          icon: LayoutDashboard, exact: true },
  { label: 'Order link', href: '/dashboard/link',     icon: Link2 },
  { label: 'Settings',   href: '/dashboard/settings', icon: Settings },
]

/* ------------------------------------------------------------------ */
/* Store preview card — shown on the right column                     */
/* ------------------------------------------------------------------ */

function StorePreviewCard({
  businessName,
  category,
  pickupAddress,
  instagram,
  tiktok,
  slug,
  logo,
}: {
  businessName: string
  category: string
  pickupAddress: string
  instagram: string
  tiktok: string
  slug: string | null | undefined
  logo: string | null
}) {
  const name = businessName.trim() || 'Your Store'

  return (
    <div className="overflow-hidden  border border-[#E9E9EA] bg-white shadow-sm">
      {/* Mini store header */}
      <div className="flex items-center gap-4 border-b border-[#E9E9EA] bg-[#F9F9FA] px-5 py-4">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt="Store logo"
            className="size-14 shrink-0  object-cover ring-2 ring-[#E9E9EA]"
          />
        ) : (
          <div className="grid size-14 shrink-0 place-items-center  bg-[#F9F9FA] text-[#0B0B0D]">
            <Store size={24} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-bold text-[#0B0B0D]">{name}</h3>
          {category && (
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#F9F9FA] px-2.5 py-0.5 text-xs font-semibold text-[#0B0B0D]">
              <Tag size={10} />
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3 px-5 py-4 text-sm">
        {pickupAddress && (
          <div className="flex items-start gap-2 text-[#8D8E91]">
            <MapPin size={14} className="mt-0.5 shrink-0 text-[#C9CACD]" />
            <span>{pickupAddress}</span>
          </div>
        )}
        {(instagram || tiktok) && (
          <div className="flex flex-wrap gap-2">
            {instagram && (
              <span className="flex items-center gap-1 rounded-lg bg-[#F9F9FA] px-2.5 py-1 text-xs font-medium text-[#8D8E91]">
                <span className="font-bold text-[#C9CACD]">IG</span> {instagram}
              </span>
            )}
            {tiktok && (
              <span className="flex items-center gap-1 rounded-lg bg-[#F9F9FA] px-2.5 py-1 text-xs font-medium text-[#8D8E91]">
                <span className="text-[10px] font-bold">TT</span> {tiktok}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Order link */}
      {slug && (
        <div className="border-t border-[#E9E9EA] px-5 py-3">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#C9CACD]">
            Your order link
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[#0B0B0D]">
              astra.com/s/{slug}
            </p>
            <a
              href={`/s/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[#0B0B0D] hover:text-[#0B0B0D]"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      <div className="border-t border-[#E9E9EA] bg-[#F9F9FA] px-5 py-2.5">
        <p className="text-xs text-[#C9CACD]">
          This is how your store appears to customers.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Logo uploader                                                       */
/* ------------------------------------------------------------------ */

function LogoUploader({
  current,
  onChange,
}: {
  current: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      const url = await fileToResizedDataUrl(file, 400)
      onChange(url)
    } catch {
      setError('Could not read that image. Try another.')
    }
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative"
        aria-label="Upload store logo"
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current}
            alt="Store logo preview"
            className="size-24  object-cover ring-2 ring-[#E9E9EA] transition group-hover:ring-[#C9CACD]"
          />
        ) : (
          <div className="grid size-24 place-items-center  border-2 border-dashed border-[#E9E9EA] bg-[#F9F9FA] transition group-hover:border-[#C9CACD]">
            <Store size={28} className="text-[#C9CACD]" />
          </div>
        )}
        {/* Camera overlay */}
        <span className="absolute -bottom-1.5 -right-1.5 grid size-7 place-items-center rounded-full border-2 border-white bg-[#0B0B0D] text-white shadow">
          <Camera size={13} />
        </span>
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-semibold text-[#0B0B0D] hover:text-[#0B0B0D] transition"
        >
          {current ? 'Change logo' : 'Upload logo'}
        </button>
        {current && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-3 text-sm text-[#C9CACD] hover:text-red-500 transition"
          >
            Remove
          </button>
        )}
        <p className="mt-0.5 text-xs text-[#C9CACD]">PNG or JPG, up to 5 MB</p>
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { user, loading } = useRequireRole('seller')
  const { refresh }       = useAuth()
  const [saved, setSaved]           = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [logo, setLogo]             = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: '', category: '', pickupAddress: '', instagram: '', tiktok: '',
    },
  })

  useEffect(() => {
    if (!user) return
    form.reset({
      businessName:  user.businessName  ?? '',
      category:      user.category      ?? '',
      pickupAddress: user.pickupAddress ?? '',
      instagram:     user.instagram     ?? '',
      tiktok:        user.tiktok        ?? '',
    })
    setLogo(user.logoDataUrl ?? null)
  }, [user, form])

  if (loading || !user || user.role !== 'seller') return <PageLoader />

  const { errors, isSubmitting } = form.formState
  const watched = form.watch()

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    setSaved(false)
    const res = await updateSellerSettings({ ...values, logoDataUrl: logo })
    if (!res.ok) { setServerError(res.error); return }
    await refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <DashboardShell user={user} navItems={SELLER_NAV}>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#0B0B0D]">Store settings</h1>
        <p className="mt-1 text-sm text-[#8D8E91]">
          Manage your store profile, logo, and delivery details.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* ── LEFT: form ── */}
        <div className="flex flex-col gap-5">

          {/* Alerts */}
          {serverError && (
            <div className="flex items-center gap-2  border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-700">
              {serverError}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2  border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={16} className="shrink-0" /> Changes saved successfully.
            </div>
          )}

          {/* Store identity */}
          <div className=" border border-[#E9E9EA] bg-white">
            <div className="border-b border-[#E9E9EA] px-6 py-4">
              <p className="font-semibold text-[#0B0B0D]">Store identity</p>
              <p className="mt-0.5 text-xs text-[#8D8E91]">
                Your name and category appear on your public order page.
              </p>
            </div>
            <div className="flex flex-col gap-5 px-6 py-5">
              <Field label="Business name" htmlFor="businessName" error={errors.businessName?.message}>
                <Input
                  id="businessName"
                  autoComplete="organization"
                  placeholder="Mina's Closet"
                  aria-invalid={!!errors.businessName}
                  {...form.register('businessName')}
                />
              </Field>
              <Field label="Category" htmlFor="category" error={errors.category?.message}>
                <Select id="category" aria-invalid={!!errors.category} {...form.register('category')}>
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          {/* Delivery */}
          <div className=" border border-[#E9E9EA] bg-white">
            <div className="border-b border-[#E9E9EA] px-6 py-4">
              <p className="font-semibold text-[#0B0B0D]">Delivery</p>
              <p className="mt-0.5 text-xs text-[#8D8E91]">
                Where riders pick up orders from your store.
              </p>
            </div>
            <div className="px-6 py-5">
              <Field label="Pickup address" htmlFor="pickupAddress" error={errors.pickupAddress?.message}>
                <Input
                  id="pickupAddress"
                  autoComplete="street-address"
                  placeholder="10 KG 17 Ave, Kigali"
                  aria-invalid={!!errors.pickupAddress}
                  {...form.register('pickupAddress')}
                />
              </Field>
            </div>
          </div>

          {/* Social links */}
          <div className=" border border-[#E9E9EA] bg-white">
            <div className="border-b border-[#E9E9EA] px-6 py-4">
              <p className="font-semibold text-[#0B0B0D]">Social links</p>
              <p className="mt-0.5 text-xs text-[#8D8E91]">
                Shown on your order page so customers can follow you.
              </p>
            </div>
            <div className="flex flex-col gap-5 px-6 py-5">
              <Field label="Instagram handle" htmlFor="instagram" optional>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-[#C9CACD]">
                    @
                  </span>
                  <Input
                    id="instagram"
                    autoComplete="off"
                    placeholder="yourhandle"
                    className="pl-7"
                    {...form.register('instagram')}
                  />
                </div>
              </Field>
              <Field label="TikTok handle" htmlFor="tiktok" optional>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-[#C9CACD]">
                    @
                  </span>
                  <Input
                    id="tiktok"
                    autoComplete="off"
                    placeholder="yourhandle"
                    className="pl-7"
                    {...form.register('tiktok')}
                  />
                </div>
              </Field>
            </div>
          </div>

          <SubmitButton loading={isSubmitting}>Save changes</SubmitButton>
        </div>

        {/* ── RIGHT: logo + preview ── */}
        <div className="flex flex-col gap-5">

          {/* Logo card */}
          <div className=" border border-[#E9E9EA] bg-white">
            <div className="border-b border-[#E9E9EA] px-5 py-4">
              <p className="font-semibold text-[#0B0B0D]">Store logo</p>
              <p className="mt-0.5 text-xs text-[#8D8E91]">
                Shown at the top of your public order page.
              </p>
            </div>
            <div className="flex flex-col items-center px-5 py-6">
              <LogoUploader current={logo} onChange={setLogo} />
            </div>
          </div>

          {/* Live preview */}
          <StorePreviewCard
            businessName={watched.businessName}
            category={watched.category}
            pickupAddress={watched.pickupAddress}
            instagram={watched.instagram ?? ''}
            tiktok={watched.tiktok ?? ''}
            slug={user.slug}
            logo={logo}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
