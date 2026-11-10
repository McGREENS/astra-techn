import type { ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type Variant = 'primary' | 'light' | 'outline'

type Props = ComponentProps<'button'> & { loading?: boolean; variant?: Variant }

export function SubmitButton({
  loading,
  variant = 'primary',
  className,
  children,
  disabled,
  ...props
}: Props) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      data-slot="submit-button"
      className={cn(
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DC4FF] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-[#0A1F44] text-white hover:bg-[#173B76]',
        variant === 'light' &&
          'bg-[#7DC4FF] text-[#0A1F44] shadow-[0_8px_24px_rgba(125,196,255,.2)] hover:bg-[#a6d7ff]',
        variant === 'outline' && 'border border-[#B8D4EE] bg-white text-[#0A1F44] hover:bg-[#F4F9FF]',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
