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
import { logIn } from '@/lib/auth/actions'

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
    const res = await logIn(values.email, values.password)
    setSubmitting(false)
    if (!res.ok) {
      setFormError(res.error)
      return
    }
    await refresh()
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
        <Link
          href="/forgot-password"
          className="font-medium text-[#0B0B0D] hover:text-[#3A3D44]"
        >
          Forgot password?
        </Link>
      }
    >
      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-sm border border-[#C9CACD] bg-[#F9F9FA] px-3.5 py-3 text-sm text-[#0B0B0D]"
        >
          <AlertCircle size={15} className="shrink-0 text-[#8D8E91]" /> {formError}
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
          Log in <ArrowRight size={15} />
        </SubmitButton>
      </form>

      {/* Demo admin hint — brand: Chrome text, Silver border, Platinum surface */}
      <div className="mt-6 border border-[#E9E9EA] bg-[#F9F9FA] px-4 py-3 text-xs text-[#8D8E91]">
        <span className="font-medium text-[#0B0B0D]">Demo admin:</span>{' '}
        admin@astra.com / admin1234
      </div>

      <p className="mt-4 text-center text-sm text-[#8D8E91]">
        New to Astra?{' '}
        <Link
          href="/get-started"
          className="font-medium text-[#0B0B0D] hover:text-[#3A3D44]"
        >
          Get started
        </Link>
      </p>
    </AuthLayout>
  )
}
