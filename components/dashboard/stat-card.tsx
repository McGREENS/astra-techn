import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div className="border border-[#E9E9EA] bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">{label}</p>
      <p className={cn('mt-2 text-3xl font-light tracking-tight', accent ? 'text-[#3A3D44]' : 'text-[#0B0B0D]')}>
        {value}
      </p>
    </div>
  )
}
