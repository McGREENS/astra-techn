'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, XCircle } from 'lucide-react'

import { OrderStatusBadge } from './order-status-badge'
import { cancelOrder } from '@/lib/orders/actions'
import type { OrderWithItems } from '@/lib/orders/actions'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function OrderRow({ order, onCancelled }: { order: OrderWithItems; onCancelled: (id: string) => void }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const canCancel = order.status === 'pending' || order.status === 'assigned'
  const total     = order.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setLoading(true)
    const res = await cancelOrder(order.id, order.sellerId)
    setLoading(false)
    if (res.ok) onCancelled(order.id)
  }

  return (
    <>
      <tr className="cursor-pointer hover:bg-[#F9F9FA] transition-colors" onClick={() => setOpen(o => !o)}>
        <td className="px-4 py-3">
          <span className="flex items-center gap-2 text-xs text-[#8D8E91]">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <span className="font-mono text-[11px] text-[#C9CACD]">{order.id.slice(0, 8)}</span>
          </span>
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-[#0B0B0D] text-sm">{order.customerName}</p>
          <p className="text-xs text-[#8D8E91]">{order.customerPhone}</p>
        </td>
        <td className="hidden px-4 py-3 text-sm text-[#8D8E91] md:table-cell">{order.deliveryAddress}</td>
        <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
        <td className="hidden px-4 py-3 text-right text-sm font-medium text-[#0B0B0D] sm:table-cell">{fmt(total)}</td>
        <td className="px-4 py-3 text-right text-xs text-[#C9CACD]">{fmtDate(order.createdAt)}</td>
        <td className="px-4 py-3 text-right">
          {canCancel && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCancel() }}
              disabled={loading}
              className="inline-flex items-center gap-1 border border-[#E9E9EA] px-2.5 py-1 text-xs text-[#8D8E91] hover:border-red-200 hover:text-red-500 disabled:opacity-50 transition"
            >
              <XCircle size={12} /> {loading ? '…' : 'Cancel'}
            </button>
          )}
        </td>
      </tr>

      {open && (
        <tr className="bg-[#F9F9FA]">
          <td colSpan={7} className="px-6 pb-4 pt-2">
            <div className="grid gap-3 text-sm">
              {order.note && (
                <p className="text-[#8D8E91]">
                  <span className="font-medium text-[#0B0B0D]">Note: </span>{order.note}
                </p>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-widest text-[#C9CACD]">
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Unit</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E9EA]">
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-1.5 text-[#0B0B0D]">{it.productName}</td>
                      <td className="py-1.5 text-right text-[#8D8E91]">{it.quantity}</td>
                      <td className="py-1.5 text-right text-[#8D8E91]">{fmt(it.unitPrice)}</td>
                      <td className="py-1.5 text-right font-medium text-[#0B0B0D]">{fmt(it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#E9E9EA]">
                    <td colSpan={3} className="pt-2 text-right text-xs font-medium uppercase tracking-widest text-[#8D8E91]">Total</td>
                    <td className="pt-2 text-right font-medium text-[#0B0B0D]">{fmt(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function OrdersTable({ orders, onOrderCancelled }: { orders: OrderWithItems[]; onOrderCancelled: (id: string) => void }) {
  if (!orders.length) {
    return (
      <div className="border border-dashed border-[#E9E9EA] bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-[#0B0B0D]">No orders yet</p>
        <p className="mt-1 text-sm text-[#8D8E91]">Create your first order using the button above.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden border border-[#E9E9EA] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#E9E9EA] text-left text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
              <th className="px-4 py-3 w-20">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="hidden px-4 py-3 md:table-cell">Address</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell">Total</th>
              <th className="px-4 py-3 text-right">Date</th>
              <th className="px-4 py-3 text-right w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E9EA]">
            {orders.map((o) => <OrderRow key={o.id} order={o} onCancelled={onOrderCancelled} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
