import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Brand: inputs soften to 2 px, border is Silver, focus ring is Flare
        'flex h-12 w-full rounded-sm border border-[#C9CACD] bg-white px-3.5 text-sm',
        'text-[#0B0B0D] outline-none transition',
        'placeholder:text-[#8D8E91]',
        'focus:border-[#8D8E91] focus:ring-2 focus:ring-[#CFD9F6]/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:ring-red-100',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
