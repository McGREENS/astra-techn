'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, X } from 'lucide-react'

import { Field } from '@/components/auth/field'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { createOrder } from '@/lib/orders/actions'

const itemSchema = z.object({
  productName: z.string().min(1, 'Enter a product name'),
  quantity:    z.preprocess((v) => Number(v), z.number().int().min(1, 'At least 1')),
  unitPrice:   z.preprocess((v) => Number(v), z.number().min(0, 'Enter a price')),
})

const schema = z.object({
  customerName:    z.string().min(2, 'Enter the customer name'),
  customerPhone:   z.string().min(7, 'Enter the customer phone'),
  deliveryAddress: z.string().min(5, 'Enter the delivery address'),
  note:            z.string().optional(),
  items:           z.array(itemSchema).min(1, 'Add at least one item'),
})

type FormValues = {
  customerName:    string
  customerPhone:   string
  deliveryAddress: string
  note?:           string
  items: { productName: string; quantity: number; unitPrice: number }[]
}

export function NewOrderForm({ sellerId, onSuccess, onClose }: {
  sellerId: string
  onSuccess: () => void
  onClose: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      customerName: '', customerPhone: '', deliveryAddress: '', note: '',
      items: [{ productName: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const res = await createOrder({
      sellerId,
      customerName:    values.customerName,
      customerPhone:   values.customerPhone,
      deliveryAddress: values.deliveryAddress,
      note:            values.note,
      items: values.items.map((it) => ({
        productName: it.productName,
        quantity:    it.quantity,
        unitPrice:   Math.round(it.unitPrice * 100),
      })),
    })
    if (!res.ok) { setServerError(res.error); return }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="relative w-full max-w-lg bg-white shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9E9EA] px-6 py-4">
          <h2 className="text-base font-medium text-[#0B0B0D]">New order</h2>
          <button type="button" onClick={onClose}
            className="grid size-8 place-items-center text-[#8D8E91] hover:text-[#0B0B0D] transition"
            aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 overflow-y-auto px-6 py-5" noValidate>
          {serverError && (
            <p className="border border-[#E9E9EA] bg-[#F9F9FA] px-4 py-3 text-sm text-[#0B0B0D]">
              {serverError}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Customer name" htmlFor="customerName" error={errors.customerName?.message}>
              <Input id="customerName" placeholder="Amara Diallo" {...form.register('customerName')} aria-invalid={!!errors.customerName} />
            </Field>
            <Field label="Customer phone" htmlFor="customerPhone" error={errors.customerPhone?.message}>
              <Input id="customerPhone" type="tel" placeholder="+1 555 0100" {...form.register('customerPhone')} aria-invalid={!!errors.customerPhone} />
            </Field>
          </div>

          <Field label="Delivery address" htmlFor="deliveryAddress" error={errors.deliveryAddress?.message}>
            <Input id="deliveryAddress" placeholder="Street, city, area" {...form.register('deliveryAddress')} aria-invalid={!!errors.deliveryAddress} />
          </Field>

          <Field label="Note for rider" htmlFor="note" optional>
            <Input id="note" placeholder="Leave at the gate, ring twice…" {...form.register('note')} />
          </Field>

          <div className="grid gap-2">
            <p className="text-sm font-medium text-[#0B0B0D]">Items</p>
            {errors.items?.root && <p className="text-xs text-red-500">{errors.items.root.message}</p>}
            {fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-[1fr_72px_88px_32px] items-start gap-2">
                <div className="grid gap-1">
                  <Input placeholder="Product name" {...form.register(`items.${i}.productName`)} aria-invalid={!!errors.items?.[i]?.productName} />
                  {errors.items?.[i]?.productName && <p className="text-xs text-red-500">{errors.items[i]!.productName!.message}</p>}
                </div>
                <div className="grid gap-1">
                  <Input type="number" min={1} placeholder="Qty" {...form.register(`items.${i}.quantity`)} aria-invalid={!!errors.items?.[i]?.quantity} />
                  {errors.items?.[i]?.quantity && <p className="text-xs text-red-500">{errors.items[i]!.quantity!.message}</p>}
                </div>
                <div className="grid gap-1">
                  <Input type="number" min={0} step={0.01} placeholder="Price" {...form.register(`items.${i}.unitPrice`)} aria-invalid={!!errors.items?.[i]?.unitPrice} />
                  {errors.items?.[i]?.unitPrice && <p className="text-xs text-red-500">{errors.items[i]!.unitPrice!.message}</p>}
                </div>
                <button type="button" onClick={() => remove(i)} disabled={fields.length === 1}
                  className="mt-1 grid size-10 place-items-center text-[#C9CACD] hover:text-red-500 disabled:pointer-events-none disabled:opacity-30 transition"
                  aria-label="Remove item">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => append({ productName: '', quantity: 1, unitPrice: 0 })}
              className="flex items-center gap-2 border border-dashed border-[#C9CACD] px-4 py-2.5 text-sm text-[#8D8E91] hover:border-[#8D8E91] hover:text-[#0B0B0D] transition">
              <Plus size={15} /> Add item
            </button>
          </div>

          <SubmitButton loading={isSubmitting}>Place order</SubmitButton>
        </form>
      </div>
    </div>
  )
}
