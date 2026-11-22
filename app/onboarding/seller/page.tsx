'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Check, Link2 } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Field } from '@/components/auth/field'
import { useAuth } from '@/components/auth/auth-provider'
import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { StepIndicator } from '@/components/auth/step-indicator'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { completeSellerOnboarding } from '@/lib/auth/actions'
import { slugify } from '@/lib/slug'

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
  businessName: z.string().min(2, 'Enter your business name'),
  category: z.string().min(1, 'Select a category'),
  pickupAddress: z.string().min(5, 'Enter your pickup address'),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function OnboardingSellerPage() {
  const { user, loading } = useRequireRole('seller')
  const { refresh } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      businessName: '',
      category: '',
      pickupAddress: '',
      instagram: '',
      tiktok: '',
    },
  })

  const businessName = form.watch('businessName') ?? ''
  // Preview only — the final unique slug is generated server-side on submit.
  const slug = useMemo(
    () => (businessName.trim() ? slugify(businessName) : ''),
    [businessName],
  )

  if (loading || !user || user.role !== 'seller') return <PageLoader />

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    await completeSellerOnboarding(user.id, values)
    setSubmitting(false)
    await refresh()
    router.push('/dashboard')
  }

  const { errors } = form.formState

  return (
    <AuthLayout
      step={<StepIndicator current={1} />}
      title="Set up your store"
      subtitle="This creates your shareable order link."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field label="Business name" htmlFor="businessName" error={errors.businessName?.message}>
          <Input
            id="businessName"
            autoComplete="organization"
            placeholder="Mina's Closet"
            aria-invalid={!!errors.businessName}
            {...form.register('businessName')}
          />
        </Field>

        {slug && (
          <div className="flex items-center gap-2 border border-[#E9E9EA] bg-[#F9F9FA] px-3.5 py-3 text-sm">
            <Link2 size={15} className="shrink-0 text-[#8D8E91]" />
            <span className="truncate text-[#8D8E91]">
              Your link:{' '}
              <span className="font-medium text-[#0B0B0D]">astra.africa/s/{slug}</span>
            </span>
          </div>
        )}

        <Field label="Category" htmlFor="category" error={errors.category?.message}>
          <Select
            id="category"
            aria-invalid={!!errors.category}
            {...form.register('category')}
          >
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Pickup address"
          htmlFor="pickupAddress"
          error={errors.pickupAddress?.message}
        >
          <Input
            id="pickupAddress"
            autoComplete="street-address"
            placeholder="Street, city, area"
            aria-invalid={!!errors.pickupAddress}
            {...form.register('pickupAddress')}
          />
        </Field>
        <Field label="Instagram handle" htmlFor="instagram" optional>
          <Input
            id="instagram"
            autoComplete="off"
            placeholder="@yourhandle"
            {...form.register('instagram')}
          />
        </Field>
        <Field label="TikTok handle" htmlFor="tiktok" optional>
          <Input
            id="tiktok"
            autoComplete="off"
            placeholder="@yourhandle"
            {...form.register('tiktok')}
          />
        </Field>
        <SubmitButton loading={submitting}>
          <Check size={16} /> Finish setup
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
