import type { ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline'

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
        // Brand: buttons soften to 2 px (rounded-sm), label weight + tracking
        'inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm',
        'text-xs font-medium uppercase tracking-widest transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CFD9F6]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-[#0B0B0D] text-white hover:bg-[#3A3D44]',
        variant === 'outline' && 'border border-[#C9CACD] bg-white text-[#0B0B0D] hover:bg-[#E9E9EA]',
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
