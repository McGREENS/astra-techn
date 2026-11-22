'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ImagePlus } from 'lucide-react'

import { Field } from '@/components/auth/field'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/auth/submit-button'
import { upsertProduct } from '@/lib/products/actions'
import { fileToResizedDataUrl } from '@/lib/image'
import type { Product } from '@/lib/products/actions'

const schema = z.object({
  name:        z.string().min(1, 'Enter a product name'),
  description: z.string().optional(),
  price:       z.preprocess(
    (v) => Math.round(Number(v) * 100),     // dollars → cents
    z.number().min(0, 'Price cannot be negative'),
  ),
})

type FormValues = { name: string; description?: string; price: number }

export function ProductForm({
  sellerId,
  product,
  onDone,
  onClose,
}: {
  sellerId: string
  product?: Product                      // present = edit mode
  onDone: (p: Product) => void
  onClose: () => void
}) {
  const [image, setImage]       = useState<string | null>(product?.imageDataUrl ?? null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name:        product?.name        ?? '',
      description: product?.description ?? '',
      price:       product ? product.price / 100 : 0,
    },
  })

  const { errors, isSubmitting } = form.formState

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageError(null)
    try { setImage(await fileToResizedDataUrl(file, 600)) }
    catch { setImageError('Could not read that image.') }
    e.target.value = ''
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const res = await upsertProduct({
      id:           product?.id,
      sellerId,
      name:         values.name,
      description:  values.description,
      price:        values.price,          // already cents via z.preprocess
      imageDataUrl: image,
    })
    if (!res.ok) { setServerError(res.error); return }
    onDone(res.product)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg bg-white shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E9E9EA] px-6 py-4">
          <h2 className="text-base font-medium text-[#0B0B0D]">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button type="button" onClick={onClose}
            className="grid size-8 place-items-center text-[#8D8E91] hover:text-[#0B0B0D] transition"
            aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 overflow-y-auto px-6 py-5" noValidate>

          {serverError && (
            <p className="border border-[#E9E9EA] bg-[#F9F9FA] px-4 py-3 text-sm text-[#0B0B0D]">
              {serverError}
            </p>
          )}

          {/* Image uploader */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#0B0B0D]">Product photo</span>
            <button type="button" onClick={() => imgRef.current?.click()}
              className="group relative flex h-40 w-full items-center justify-center border border-dashed border-[#C9CACD] bg-[#F9F9FA] hover:border-[#8D8E91] transition overflow-hidden">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Product" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#C9CACD] group-hover:text-[#8D8E91]">
                  <ImagePlus size={28} />
                  <span className="text-xs font-medium uppercase tracking-widest">Upload photo</span>
                </div>
              )}
            </button>
            {image && (
              <button type="button" onClick={() => setImage(null)}
                className="self-start text-xs text-[#C9CACD] hover:text-red-500 transition">
                Remove photo
              </button>
            )}
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
            <input ref={imgRef} type="file" accept="image/*" className="sr-only" onChange={handleImage} />
          </div>

          <Field label="Product name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" placeholder="Ankara wrap dress" autoFocus
              {...form.register('name')} aria-invalid={!!errors.name} />
          </Field>

          <Field label="Description" htmlFor="description" optional>
            <textarea
              id="description"
              rows={2}
              placeholder="Short description visible to customers…"
              className="w-full border border-[#C9CACD] bg-white px-3.5 py-3 text-sm text-[#0B0B0D] outline-none placeholder:text-[#8D8E91] focus:border-[#8D8E91] focus:ring-2 focus:ring-[#CFD9F6]/50 resize-none"
              {...form.register('description')}
            />
          </Field>

          <Field label="Price" htmlFor="price" error={errors.price?.message}
            hint="Enter 0 if the price is set at delivery.">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-[#8D8E91]">$</span>
              <Input id="price" type="number" min={0} step={0.01} placeholder="0.00"
                className="pl-7"
                {...form.register('price')} aria-invalid={!!errors.price} />
            </div>
          </Field>

          <SubmitButton loading={isSubmitting}>
            {product ? 'Save changes' : 'Add product'}
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}
