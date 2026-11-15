'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, MailCheck } from 'lucide-react'

import { AuthLayout } from '@/components/auth/auth-layout'
import { Field } from '@/components/auth/field'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from '@/lib/auth/actions'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
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

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sentEmail, setSentEmail]   = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    await requestPasswordReset(values.email)
    setSubmitting(false)
    setSentEmail(values.email)
  }

  const { errors } = form.formState

  if (sentEmail) {
    return (
      <AuthLayout title="Check your inbox" footer={backLink}>
        <div className="grid gap-5 border border-[#E9E9EA] bg-[#F9F9FA] p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center border border-[#E9E9EA] bg-white text-[#0B0B0D]">
            <MailCheck size={22} />
          </span>
          <p className="text-sm text-[#8D8E91]">
            If an account exists for{' '}
            <span className="font-medium text-[#0B0B0D]">{sentEmail}</span>,
            reset instructions have been sent.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send reset instructions."
      footer={backLink}
    >
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
        <SubmitButton loading={submitting}>
          Send reset link <ArrowRight size={15} />
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
