'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Field } from '@/components/auth/field'
import { useAuth } from '@/components/auth/auth-provider'
import { useRequireGuest } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { PasswordField } from '@/components/auth/password-field'
import { StepIndicator } from '@/components/auth/step-indicator'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { signUp } from '@/lib/auth/actions'

const phoneRegex = /^[+]?[\d\s().-]{7,}$/

const schema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    phone: z
      .string()
      .min(7, 'Enter a valid phone number')
      .refine((v) => phoneRegex.test(v), 'Enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormValues = z.infer<typeof schema>

export default function SignupRiderPage() {
  const { loading } = useRequireGuest()
  const { refresh } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
  })

  if (loading) return <PageLoader />

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    const res = await signUp({
      name: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: 'rider',
    })
    setSubmitting(false)
    if (!res.ok) {
      form.setError('email', { message: res.error })
      return
    }
    await refresh()
    router.push('/onboarding/rider')
  }

  const { errors } = form.formState

  return (
    <AuthLayout
      step={<StepIndicator current={0} />}
      title="Create your rider account"
      subtitle="You'll add your details next, then we review your profile."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#0B0B0D] hover:text-[#3A3D44]">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Jon Brewster"
            aria-invalid={!!errors.fullName}
            {...form.register('fullName')}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...form.register('email')}
          />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 0100"
            aria-invalid={!!errors.phone}
            {...form.register('phone')}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="Use at least 8 characters."
        >
          <PasswordField
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
        </Field>
        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirmPassword}
            {...form.register('confirmPassword')}
          />
        </Field>
        <SubmitButton loading={submitting}>
          Create account <ArrowRight size={16} />
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
