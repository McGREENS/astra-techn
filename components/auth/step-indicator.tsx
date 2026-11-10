import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

const STEPS = ['Account', 'Details', 'Done'] as const

/** Multi-step indicator: Account -> Details -> Done. `current` is 0-indexed. */
export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition',
                done
                  ? 'bg-[#0A1F44] text-white'
                  : active
                    ? 'bg-[#7DC4FF] text-[#0A1F44] ring-2 ring-[#7DC4FF]/40'
                    : 'bg-[#E8F3FF] text-[#48627F]',
              )}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-semibold',
                i <= current ? 'text-[#0A1F44]' : 'text-[#48627F]',
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn('h-px w-5 sm:w-8', i < current ? 'bg-[#0A1F44]' : 'bg-[#CFE6FF]')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
