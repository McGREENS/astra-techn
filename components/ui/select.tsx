import type { ComponentProps } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          'flex h-12 w-full appearance-none rounded-sm border border-[#C9CACD] bg-white',
          'pl-3.5 pr-10 text-sm text-[#0B0B0D] outline-none transition',
          'focus:border-[#8D8E91] focus:ring-2 focus:ring-[#CFD9F6]/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8D8E91]"
      />
    </div>
  )
}

export { Select }
