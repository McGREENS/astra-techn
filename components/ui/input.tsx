import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-12 w-full rounded-xl border border-[#CFE6FF] bg-white px-3.5 text-sm text-[#0A1F44] outline-none transition placeholder:text-slate-400 focus:border-[#4C99D4] focus:ring-2 focus:ring-[#7DC4FF]/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-200',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
