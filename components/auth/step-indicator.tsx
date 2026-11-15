import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = ['Account', 'Details', 'Done'] as const

/** Multi-step indicator: Account → Details → Done. `current` is 0-indexed. */
export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-sm text-xs font-medium transition',
                done   ? 'bg-[#0B0B0D] text-white' :
                active ? 'bg-[#E9E9EA] text-[#0B0B0D] ring-1 ring-[#C9CACD]' :
                         'bg-[#F9F9FA] text-[#8D8E91] border border-[#E9E9EA]',
              )}
            >
              {done ? <Check size={12} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                i <= current ? 'text-[#0B0B0D]' : 'text-[#8D8E91]',
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px w-5 sm:w-8',
                  i < current ? 'bg-[#8D8E91]' : 'bg-[#E9E9EA]',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
