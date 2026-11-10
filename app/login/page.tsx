'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowRight } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Field } from '@/components/auth/field'
import { useAuth } from '@/components/auth/auth-provider'
import { useRequireGuest } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { PasswordField } from '@/components/auth/password-field'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { login } from '@/lib/mock-auth'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { loading } = useRequireGuest()
  const { refresh } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  if (loading) return <PageLoader />

  const onSubmit = async (values: FormValues) => {
    setFormError(null)
    setSubmitting(true)
    const res = await login(values.email, values.password)
    setSubmitting(false)
    if (!res.ok) {
      setFormError(res.error)
      return
    }
    refresh()
    const dest =
      res.user.role === 'seller'
        ? '/dashboard'
        : res.user.role === 'rider'
          ? '/rider/pending'
          : '/admin'
    router.push(dest)
  }

  const { errors } = form.formState

  return (
    <AuthLayout
      title="Log in"
      subtitle="One login for sellers, riders, and admins."
      footer={
        <Link href="/forgot-password" className="font-semibold text-[#2872A8] hover:text-[#0A1F44]">
          Forgot password?
        </Link>
      }
    >
      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700"
        >
          <AlertCircle size={16} className="shrink-0" /> {formError}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
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
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordField
            id="password"
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
        </Field>
        <SubmitButton loading={submitting}>
          Log in <ArrowRight size={16} />
        </SubmitButton>
      </form>

      <div className="mt-6 rounded-xl border border-[#CFE6FF] bg-[#F7FBFF] px-3.5 py-3 text-xs text-[#48627F]">
        <span className="font-semibold text-[#0A1F44]">Demo admin:</span>{' '}
        admin@astra.com / admin1234
      </div>

      <p className="mt-4 text-center text-sm text-[#48627F]">
        New to Astra?{' '}
        <Link href="/get-started" className="font-semibold text-[#2872A8] hover:text-[#0A1F44]">
          Get started
        </Link>
      </p>
    </AuthLayout>
  )
}
