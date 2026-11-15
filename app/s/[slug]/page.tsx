import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import { getSellerBySlug } from '@/lib/seller/actions'
import { PublicOrderForm } from './order-form'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const seller = await getSellerBySlug(slug)
  if (!seller) return { title: 'Store not found' }
  return {
    title: seller.businessName ?? 'Order now',
    description: `Place a delivery order from ${seller.businessName ?? 'this store'} powered by Astra.`,
  }
}

export default async function PublicStorePage({ params }: Props) {
  const { slug } = await params
  const seller = await getSellerBySlug(slug)
  if (!seller) notFound()

  return (
    <main className="min-h-dvh bg-[#F9F9FA]">
      {/* Top bar */}
      <header className="border-b border-[#E9E9EA] bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          {seller.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={seller.logoDataUrl}
              alt={`${seller.businessName} logo`}
              className="size-14 shrink-0 object-cover ring-1 ring-[#E9E9EA]"
            />
          ) : (
            <div className="grid size-14 shrink-0 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-xl font-medium text-[#0B0B0D]">
              {(seller.businessName ?? slug)[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">
              Powered by Astra
            </p>
            <h1 className="mt-0.5 truncate text-lg font-medium text-[#0B0B0D]">
              {seller.businessName ?? slug}
            </h1>
          </div>
          {seller.category && (
            <span className="shrink-0 border border-[#E9E9EA] bg-[#F9F9FA] px-3 py-1 text-xs font-medium text-[#8D8E91]">
              {seller.category}
            </span>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        {seller.pickupAddress && (
          <div className="mb-5 border border-[#E9E9EA] bg-white px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Pickup address</p>
            <p className="mt-1 text-sm font-medium text-[#0B0B0D]">{seller.pickupAddress}</p>
          </div>
        )}
        <PublicOrderForm sellerId={seller.id} />
      </div>
    </main>
  )
}
