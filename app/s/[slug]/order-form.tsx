'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Plus, Trash2 } from 'lucide-react'

import { Field } from '@/components/auth/field'
import { SubmitButton } from '@/components/auth/submit-button'
import { Input } from '@/components/ui/input'
import { createOrder } from '@/lib/orders/actions'

const itemSchema = z.object({
  productName: z.string().min(1, 'Enter a product name'),
  quantity:    z.preprocess((v) => Number(v), z.number().int().min(1, 'At least 1')),
})

const schema = z.object({
  customerName:    z.string().min(2, 'Enter your name'),
  customerPhone:   z.string().min(7, 'Enter your phone number'),
  deliveryAddress: z.string().min(5, 'Enter your delivery address'),
  note:            z.string().optional(),
  items:           z.array(itemSchema).min(1, 'Add at least one item'),
})

type FormValues = {
  customerName:    string
  customerPhone:   string
  deliveryAddress: string
  note?:           string
  items: { productName: string; quantity: number }[]
}

export function PublicOrderForm({ sellerId }: { sellerId: string }) {
  const [submitted, setSubmitted]     = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      customerName: '', customerPhone: '', deliveryAddress: '', note: '',
      items: [{ productName: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const { errors, isSubmitting }   = form.formState

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const res = await createOrder({
      sellerId,
      customerName:    values.customerName,
      customerPhone:   values.customerPhone,
      deliveryAddress: values.deliveryAddress,
      note:            values.note,
      items: values.items.map((it) => ({ productName: it.productName, quantity: it.quantity, unitPrice: 0 })),
    })
    if (!res.ok) { setServerError(res.error); return }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="border border-[#E9E9EA] bg-white px-6 py-10 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-[#0B0B0D]">
          <CheckCircle size={22} />
        </div>
        <h2 className="text-lg font-medium text-[#0B0B0D]">Order placed</h2>
        <p className="mt-2 text-sm text-[#8D8E91]">
          We&rsquo;ve received your order and are finding a rider. You&rsquo;ll be contacted
          on <span className="font-medium text-[#0B0B0D]">{form.getValues('customerPhone')}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[#E9E9EA] bg-white">
      <div className="border-b border-[#E9E9EA] px-6 py-4">
        <h2 className="text-base font-medium text-[#0B0B0D]">Place a delivery order</h2>
        <p className="mt-0.5 text-sm text-[#8D8E91]">Fill in your details and we&rsquo;ll dispatch a rider.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 px-6 py-6" noValidate>
        {serverError && (
          <p className="border border-[#E9E9EA] bg-[#F9F9FA] px-4 py-3 text-sm text-[#0B0B0D]">{serverError}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="customerName" error={errors.customerName?.message}>
            <Input id="customerName" autoComplete="name" placeholder="Amara Diallo" aria-invalid={!!errors.customerName} {...form.register('customerName')} />
          </Field>
          <Field label="Phone number" htmlFor="customerPhone" error={errors.customerPhone?.message}>
            <Input id="customerPhone" type="tel" autoComplete="tel" placeholder="+1 555 0100" aria-invalid={!!errors.customerPhone} {...form.register('customerPhone')} />
          </Field>
        </div>

        <Field label="Delivery address" htmlFor="deliveryAddress" error={errors.deliveryAddress?.message}>
          <Input id="deliveryAddress" autoComplete="street-address" placeholder="Street, city, area" aria-invalid={!!errors.deliveryAddress} {...form.register('deliveryAddress')} />
        </Field>

        <Field label="Note for rider" htmlFor="note" optional>
          <Input id="note" placeholder="Leave at the gate, ring twice…" {...form.register('note')} />
        </Field>

        <div className="grid gap-2">
          <p className="text-sm font-medium text-[#0B0B0D]">What would you like delivered?</p>
          {errors.items?.root && <p className="text-xs text-red-500">{errors.items.root.message}</p>}
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-[1fr_72px_32px] items-start gap-2">
              <div className="grid gap-1">
                <Input placeholder="Item name" {...form.register(`items.${i}.productName`)} aria-invalid={!!errors.items?.[i]?.productName} />
                {errors.items?.[i]?.productName && <p className="text-xs text-red-500">{errors.items[i]!.productName!.message}</p>}
              </div>
              <div className="grid gap-1">
                <Input type="number" min={1} placeholder="Qty" {...form.register(`items.${i}.quantity`)} aria-invalid={!!errors.items?.[i]?.quantity} />
                {errors.items?.[i]?.quantity && <p className="text-xs text-red-500">{errors.items[i]!.quantity!.message}</p>}
              </div>
              <button type="button" onClick={() => remove(i)} disabled={fields.length === 1}
                className="mt-1 grid size-10 place-items-center text-[#C9CACD] hover:text-red-500 disabled:pointer-events-none disabled:opacity-30 transition"
                aria-label="Remove item">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => append({ productName: '', quantity: 1 })}
            className="flex items-center gap-2 border border-dashed border-[#C9CACD] px-4 py-2.5 text-sm text-[#8D8E91] hover:border-[#8D8E91] hover:text-[#0B0B0D] transition">
            <Plus size={15} /> Add another item
          </button>
        </div>

        <SubmitButton loading={isSubmitting}>Place order</SubmitButton>

        <p className="text-center text-xs text-[#C9CACD]">Powered by Astra Technologies</p>
      </form>
    </div>
  )
}
