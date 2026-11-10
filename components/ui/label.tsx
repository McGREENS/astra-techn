import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('text-sm font-semibold text-[#0A1F44]', className)}
      {...props}
    />
  )
}

export { Label }
