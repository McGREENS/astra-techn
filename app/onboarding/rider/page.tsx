'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Upload } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Field } from '@/components/auth/field'
import { useAuth } from '@/components/auth/auth-provider'
import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { StepIndicator } from '@/components/auth/step-indicator'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { completeRiderOnboarding } from '@/lib/auth/actions'
import { fileToResizedDataUrl } from '@/lib/image'

const AREAS = [
  'Downtown',
  'Westside',
  'Eastside',
  'Northside',
  'Southside',
  'Central',
] as const

const schema = z.object({
  nationalId: z.string().min(4, 'Enter your national ID number'),
  plateNumber: z.string().min(3, 'Enter your plate number'),
  area: z.string().min(1, 'Select your area of operation'),
})

type FormValues = z.infer<typeof schema>

export default function OnboardingRiderPage() {
  const { user, loading } = useRequireRole('rider')
  const { refresh } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { nationalId: '', plateNumber: '', area: '' },
  })

  if (loading || !user || user.role !== 'rider') return <PageLoader />

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    try {
      const url = await fileToResizedDataUrl(file)
      setPhoto(url)
    } catch {
      setPhotoError('Could not read that image. Try another.')
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!photo) {
      setPhotoError('Add a profile photo')
      return
    }
    setSubmitting(true)
    await completeRiderOnboarding(user.id, {
      nationalId: values.nationalId,
      plateNumber: values.plateNumber,
      area: values.area,
      photoDataUrl: photo,
    })
    setSubmitting(false)
    await refresh()
    router.push('/rider/pending')
  }

  const { errors } = form.formState

  return (
    <AuthLayout
      step={<StepIndicator current={1} />}
      title="Rider details"
      subtitle="We review these before you can start accepting deliveries."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field label="National ID number" htmlFor="nationalId" error={errors.nationalId?.message}>
          <Input
            id="nationalId"
            autoComplete="off"
            placeholder="ID-992013"
            aria-invalid={!!errors.nationalId}
            {...form.register('nationalId')}
          />
        </Field>
        <Field label="Plate number" htmlFor="plateNumber" error={errors.plateNumber?.message}>
          <Input
            id="plateNumber"
            autoComplete="off"
            placeholder="ABC-1234"
            aria-invalid={!!errors.plateNumber}
            {...form.register('plateNumber')}
          />
        </Field>
        <Field label="Area of operation" htmlFor="area" error={errors.area?.message}>
          <Select id="area" aria-invalid={!!errors.area} {...form.register('area')}>
            <option value="" disabled>
              Select an area
            </option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-1.5">
          <span className="text-sm font-medium text-[#0B0B0D]">Profile photo</span>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#C9CACD] bg-[#F9F9FA] px-4 py-6 text-center transition hover:border-[#8D8E91]">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Profile preview" className="size-20 object-cover ring-1 ring-[#C9CACD]" />
            ) : (
              <span className="grid size-12 place-items-center border border-[#E9E9EA] bg-white text-[#8D8E91]">
                <Upload size={18} />
              </span>
            )}
            <span className="text-sm font-medium text-[#0B0B0D]">
              {photo ? 'Change photo' : 'Click to upload'}
            </span>
            <span className="text-xs text-[#8D8E91]">PNG or JPG.</span>
            <input type="file" accept="image/*" className="sr-only" onChange={onPhotoChange} />
          </label>
          {photoError && <p className="text-xs text-red-500">{photoError}</p>}
        </div>

        <SubmitButton loading={submitting}>
          Submit for review <ArrowRight size={16} />
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
