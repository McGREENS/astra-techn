import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'

export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor}>{label}</Label>
        {optional && <span className="text-xs font-normal text-[#48627F]">Optional</span>}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#48627F]">{hint}</p>
      ) : null}
    </div>
  )
}
