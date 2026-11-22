import { notFound } from 'next/navigation'
import { Metadata } from 'next'

import { getSellerBySlug } from '@/lib/seller/actions'
import { getPublicProducts } from '@/lib/products/actions'
import { StoreClient } from './store-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const seller   = await getSellerBySlug(slug)
  if (!seller) return { title: 'Store not found' }
  return {
    title: seller.businessName ?? 'Order now',
    description: `Order from ${seller.businessName ?? 'this store'} — delivery powered by Astra.`,
  }
}

export default async function PublicStorePage({ params }: Props) {
  const { slug }   = await params
  const seller     = await getSellerBySlug(slug)
  if (!seller) notFound()

  const products   = await getPublicProducts(seller.id)

  return (
    <StoreClient
      seller={{
        id:            seller.id,
        businessName:  seller.businessName,
        logoDataUrl:   seller.logoDataUrl ?? null,
        pickupAddress: seller.pickupAddress ?? null,
        category:      seller.category ?? null,
        instagram:     seller.instagram ?? null,
        tiktok:        seller.tiktok ?? null,
      }}
      products={products}
      slug={slug}
    />
  )
}
