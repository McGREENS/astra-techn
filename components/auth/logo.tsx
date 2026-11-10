import Link from 'next/link'
import { Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

export function AstraLogo({
  light = false,
  href = '/',
  className,
}: {
  light?: boolean
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 font-bold tracking-[-0.04em]',
        light ? 'text-white' : 'text-[#0A1F44]',
        className,
      )}
    >
      <span className="grid size-8 place-items-center rounded-[10px] bg-[#7DC4FF] text-[#0A1F44]">
        <Sparkles size={18} fill="currentColor" />
      </span>
      <span className="text-[21px]">Astra</span>
    </Link>
  )
}
