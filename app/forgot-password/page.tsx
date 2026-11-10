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
import { requestPasswordReset } from '@/lib/mock-auth'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sentEmail, setSentEmail] = useState<string | null>(null)

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
      <AuthLayout
        title="Check your inbox"
        footer={
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-[#2872A8] hover:text-[#0A1F44]"
          >
            <ArrowLeft size={15} /> Back to log in
          </Link>
        }
      >
        <div className="grid gap-4 rounded-2xl border border-[#CFE6FF] bg-[#F7FBFF] p-6 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E8F3FF] text-[#2872A8]">
            <MailCheck size={26} />
          </span>
          <p className="text-sm text-[#48627F]">
            If an account exists for{' '}
            <span className="font-semibold text-[#0A1F44]">{sentEmail}</span>, reset
            instructions have been sent.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send reset instructions."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-[#2872A8] hover:text-[#0A1F44]"
        >
          <ArrowLeft size={15} /> Back to log in
        </Link>
      }
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
          Send reset link <ArrowRight size={16} />
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}
