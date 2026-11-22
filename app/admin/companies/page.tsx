'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, CheckCircle2, Plus, X } from 'lucide-react'

import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { AdminShell } from '@/components/admin/admin-shell'
import { Field } from '@/components/auth/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/auth/submit-button'
import { getDeliveryCompanies, createDeliveryCompany } from '@/lib/admin/company-actions'
import type { SafeUser } from '@/lib/auth/types'

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

const schema = z.object({
  companyName:  z.string().min(2, 'Enter the company name'),
  contactName:  z.string().min(2, 'Enter the contact person\'s name'),
  email:        z.string().email('Enter a valid email address'),
  phone:        z.string().optional(),
})

type FormValues = z.infer<typeof schema>

/* ------------------------------------------------------------------ */
/* Create company drawer                                              */
/* ------------------------------------------------------------------ */

function CreateCompanyForm({
  onCreated,
  onClose,
}: {
  onCreated: (company: SafeUser, tempPassword: string, emailSent: boolean) => void
  onClose: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { companyName: '', contactName: '', email: '', phone: '' },
  })

  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const res = await createDeliveryCompany(values)
    if (!res.ok) { setServerError(res.error); return }
    onCreated(res.company, res.tempPassword, res.emailSent)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg bg-white shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9E9EA] px-6 py-4">
          <div>
            <h2 className="text-base font-medium text-[#0B0B0D]">Create delivery company</h2>
            <p className="mt-0.5 text-xs text-[#8D8E91]">
              An account will be created and credentials sent by email.
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="grid size-8 place-items-center text-[#8D8E91] hover:text-[#0B0B0D] transition"
            aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 overflow-y-auto px-6 py-5" noValidate>

          {serverError && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <Field label="Company name" htmlFor="companyName" error={errors.companyName?.message}>
            <Input id="companyName" autoComplete="organization"
              placeholder="Swift Logistics Ltd."
              aria-invalid={!!errors.companyName}
              {...form.register('companyName')} />
          </Field>

          <Field label="Contact person" htmlFor="contactName"
            hint="The person who will manage this account."
            error={errors.contactName?.message}>
            <Input id="contactName" autoComplete="name"
              placeholder="Jon Brewster"
              aria-invalid={!!errors.contactName}
              {...form.register('contactName')} />
          </Field>

          <Field label="Email address" htmlFor="email"
            hint="Login credentials will be sent to this address."
            error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email"
              placeholder="ops@swiftlogistics.com"
              aria-invalid={!!errors.email}
              {...form.register('email')} />
          </Field>

          <Field label="Phone number" htmlFor="phone" optional>
            <Input id="phone" type="tel" autoComplete="tel"
              placeholder="+1 555 0100"
              {...form.register('phone')} />
          </Field>

          <div className="border-t border-[#E9E9EA] pt-2">
            <SubmitButton loading={isSubmitting}>
              Create account & send credentials
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Success confirmation shown after creation                          */
/* ------------------------------------------------------------------ */

function CreatedConfirmation({
  company,
  tempPassword,
  emailSent,
  onDone,
}: {
  company: SafeUser
  tempPassword: string
  emailSent: boolean
  onDone: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md bg-white shadow-2xl">

        <div className="border-b border-[#E9E9EA] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center border border-emerald-200 bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <h2 className="text-base font-medium text-[#0B0B0D]">Account created</h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-[#8D8E91]">
            <span className="font-medium text-[#0B0B0D]">
              {company.businessName ?? company.name}
            </span>{' '}
            has been created and their login credentials have been sent to{' '}
            <span className="font-medium text-[#0B0B0D]">{company.email}</span>.
          </p>

          {/* Credentials summary — for admin reference */}
          <div className="mt-4 border border-[#E9E9EA] bg-[#F9F9FA]">
            <div className="flex items-center justify-between border-b border-[#E9E9EA] px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Email</span>
              <span className="text-sm text-[#0B0B0D]">{company.email}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">
                Temp password
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-[#0B0B0D]">
                  {tempPassword}
                </span>
                <button type="button" onClick={copy}
                  className="border border-[#E9E9EA] px-2 py-1 text-xs text-[#8D8E91] hover:bg-white transition">
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-[#C9CACD]">
            {emailSent
              ? 'Credentials have been emailed to the company. They should receive it within a few minutes.'
              : '⚠ The credentials email could not be delivered. Please share the password above with the company directly.'
            }
          </p>
        </div>

        <div className="border-t border-[#E9E9EA] px-6 py-4">
          <button type="button" onClick={onDone}
            className="w-full border border-[#0B0B0D] bg-[#0B0B0D] py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] transition">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function AdminCompaniesPage() {
  const { user, loading } = useRequireAdmin()

  const [companies,  setCompanies]  = useState<SafeUser[]>([])
  const [fetching,   setFetching]   = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [created, setCreated] = useState<{ company: SafeUser; tempPassword: string; emailSent: boolean } | null>(null)

  const load = useCallback(async () => {
    setFetching(true)
    setCompanies(await getDeliveryCompanies())
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const handleCreated = (company: SafeUser, tempPassword: string, emailSent: boolean) => {
    setShowForm(false)
    setCreated({ company, tempPassword, emailSent })
    setCompanies(prev => [company, ...prev])
  }

  const handleDone = () => setCreated(null)

  return (
    <AdminShell user={user}>

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">
            Delivery companies
          </h1>
          <p className="mt-0.5 text-sm text-[#8D8E91]">
            Registered delivery partners. Each company manages their own rider fleet.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex shrink-0 items-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] transition"
        >
          <Plus size={14} /> Add company
        </button>
      </div>

      {/* Companies table */}
      {fetching ? (
        <div className="flex items-center gap-3 border border-[#E9E9EA] bg-white px-6 py-10 text-sm text-[#8D8E91]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#E9E9EA] border-t-[#0B0B0D]" />
          Loading companies…
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-[#E9E9EA] bg-white px-6 py-20 text-center">
          <div className="mb-4 grid size-12 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-[#C9CACD]">
            <Building2 size={22} />
          </div>
          <p className="font-medium text-[#0B0B0D]">No delivery companies yet</p>
          <p className="mt-1 text-sm text-[#8D8E91]">
            Create a company account after vetting their documents offline.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] transition"
          >
            <Plus size={14} /> Add first company
          </button>
        </div>
      ) : (
        <div className="overflow-hidden border border-[#E9E9EA] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-[#E9E9EA] text-left text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="hidden px-4 py-3 md:table-cell">Phone</th>
                  <th className="px-4 py-3 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E9EA]">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-[#F9F9FA] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0B0B0D]">
                        {c.businessName ?? '—'}
                      </p>
                      <p className="text-xs text-[#8D8E91]">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8D8E91]">
                      {c.name}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-[#8D8E91] md:table-cell">
                      {c.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#C9CACD]">
                      {fmtDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create form overlay */}
      {showForm && (
        <CreateCompanyForm
          onCreated={handleCreated}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Success confirmation */}
      {created && (
        <CreatedConfirmation
          company={created.company}
          tempPassword={created.tempPassword}
          emailSent={created.emailSent}
          onDone={handleDone}
        />
      )}

    </AdminShell>
  )
}
