'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Field } from '@/components/auth/field'
import { PasswordField } from '@/components/auth/password-field'
import { SubmitButton } from '@/components/auth/submit-button'
import { resetPassword } from '@/lib/auth/actions'

const schema = z
  .object({
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormValues = z.infer<typeof schema>

const backLink = (
  <Link
    href="/login"
    className="inline-flex items-center gap-1.5 font-medium text-[#0B0B0D] hover:text-[#3A3D44]"
  >
    <ArrowLeft size={14} /> Back to log in
  </Link>
)

function ResetPasswordForm() {
  const params  = useSearchParams()
  const token   = params.get('token')
  const [done, setDone]   = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  })

  const { errors, isSubmitting } = form.formState

  /* — no token in URL — */
  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <div className="grid gap-5 border border-[#E9E9EA] bg-[#F9F9FA] p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center border border-[#E9E9EA] bg-white text-[#0B0B0D]">
            <XCircle size={22} />
          </span>
          <p className="text-sm text-[#8D8E91]">
            This reset link is missing a token. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[#0B0B0D] hover:text-[#3A3D44]"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  /* — success state — */
  if (done) {
    return (
      <AuthLayout title="Password updated" footer={backLink}>
        <div className="grid gap-5 border border-[#E9E9EA] bg-[#F9F9FA] p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center border border-[#E9E9EA] bg-white text-[#0B0B0D]">
            <CheckCircle2 size={22} />
          </span>
          <p className="text-sm text-[#8D8E91]">
            Your password has been updated. You can now log in with your new password.
          </p>
        </div>
      </AuthLayout>
    )
  }

  const onSubmit = async (values: FormValues) => {
    setError(null)
    const res = await resetPassword(token, values.password)
    if (!res.ok) { setError(res.error); return }
    setDone(true)
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="At least 8 characters."
      footer={backLink}
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 border border-[#C9CACD] bg-[#F9F9FA] px-4 py-3 text-sm text-[#0B0B0D]">
          <XCircle size={14} className="shrink-0 text-[#8D8E91]" /> {error}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
        <Field label="New password" htmlFor="password" error={errors.password?.message}>
          <PasswordField
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            aria-invalid={!!errors.password}
            {...form.register('password')}
          />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirmPassword}
            {...form.register('confirmPassword')}
          />
        </Field>
        <SubmitButton loading={isSubmitting}>
          Update password <ArrowRight size={15} />
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
