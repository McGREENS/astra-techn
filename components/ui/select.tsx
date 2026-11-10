import type { ComponentProps } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          'flex h-12 w-full appearance-none rounded-xl border border-[#CFE6FF] bg-white pl-3.5 pr-10 text-sm text-[#0A1F44] outline-none transition focus:border-[#4C99D4] focus:ring-2 focus:ring-[#7DC4FF]/40 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#48627F]"
      />
    </div>
  )
}

export { Select }
