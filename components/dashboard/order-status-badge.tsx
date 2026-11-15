import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/db/schema'

// Brand palette status colours — no external colour libraries, all brand-consistent
const CONFIG: Record<OrderStatus, { label: string; classes: string }> = {
  pending:   { label: 'Pending',   classes: 'border-[#C9CACD] bg-[#F9F9FA] text-[#3A3D44]' },
  assigned:  { label: 'Assigned',  classes: 'border-[#C9CACD] bg-[#E9E9EA] text-[#0B0B0D]' },
  picked_up: { label: 'Picked up', classes: 'border-[#8D8E91] bg-[#3A3D44]  text-[#E9E9EA]' },
  delivered: { label: 'Delivered', classes: 'border-[#3A3D44] bg-[#0B0B0D]  text-[#E9E9EA]' },
  cancelled: { label: 'Cancelled', classes: 'border-[#E9E9EA] bg-white      text-[#8D8E91]' },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, classes } = CONFIG[status]
  return (
    <span className={cn('inline-flex items-center border px-2.5 py-1 text-xs font-medium', classes)}>
      {label}
    </span>
  )
}
