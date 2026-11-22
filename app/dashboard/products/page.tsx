'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LayoutDashboard, Link2, Package, Pencil, Plus,
  Settings, ToggleLeft, ToggleRight, Trash2,
} from 'lucide-react'

import { useRequireRole } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { ProductForm } from '@/components/dashboard/product-form'
import {
  getSellerProducts,
  deleteProduct,
  toggleProductAvailability,
} from '@/lib/products/actions'
import type { Product } from '@/lib/products/actions'
import type { NavItem } from '@/components/dashboard/sidebar'

const SELLER_NAV: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',          icon: LayoutDashboard, exact: true },
  { label: 'Products',   href: '/dashboard/products', icon: Package },
  { label: 'Order link', href: '/dashboard/link',     icon: Link2 },
  { label: 'Settings',   href: '/dashboard/settings', icon: Settings },
]

function fmt(cents: number) {
  if (cents === 0) return 'Free / on delivery'
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function ProductsPage() {
  const { user, loading } = useRequireRole('seller')

  const [items, setItems]       = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)
  const [editing, setEditing]   = useState<Product | 'new' | null>(null)

  const load = useCallback(async (uid: string) => {
    setFetching(true)
    setItems(await getSellerProducts(uid))
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load(user.id) }, [user, load])

  if (loading || !user || user.role !== 'seller') return <PageLoader />

  /* ---- handlers ---- */

  const handleDone = (p: Product) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id)
      return idx >= 0 ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]
    })
    setEditing(null)
  }

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    const res = await deleteProduct(p.id, user.id)
    if (res.ok) setItems((prev) => prev.filter((x) => x.id !== p.id))
  }

  const handleToggle = async (p: Product) => {
    const res = await toggleProductAvailability(p.id, user.id, !p.available)
    if (res.ok) setItems((prev) => prev.map((x) => x.id === p.id ? { ...x, available: !x.available } : x))
  }

  return (
    <DashboardShell user={user} navItems={SELLER_NAV}>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Products</h1>
          <p className="mt-0.5 text-sm text-[#8D8E91]">
            Manage your catalogue. Customers pick from these when ordering.
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-4 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] transition"
        >
          <Plus size={14} /> Add product
        </button>
      </div>

      {/* Product grid */}
      {fetching ? (
        <div className="border border-[#E9E9EA] bg-white p-10 text-center text-sm text-[#8D8E91]">
          Loading products…
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-[#E9E9EA] bg-white px-6 py-20 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center border border-[#E9E9EA] bg-[#F9F9FA] text-[#C9CACD]">
            <Package size={22} />
          </div>
          <p className="font-medium text-[#0B0B0D]">No products yet</p>
          <p className="mt-1 text-sm text-[#8D8E91]">
            Add your first product so customers can browse and order.
          </p>
          <button
            onClick={() => setEditing('new')}
            className="mt-5 inline-flex items-center gap-2 border border-[#0B0B0D] bg-[#0B0B0D] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-white hover:bg-[#3A3D44] transition"
          >
            <Plus size={14} /> Add first product
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id}
              className={`flex flex-col border bg-white transition ${
                p.available ? 'border-[#E9E9EA]' : 'border-[#E9E9EA] opacity-60'
              }`}
            >
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden bg-[#F9F9FA]">
                {p.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageDataUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#E9E9EA]">
                    <Package size={36} />
                  </div>
                )}
                {/* Availability badge */}
                <span className={`absolute right-2 top-2 border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${
                  p.available
                    ? 'border-[#3A3D44] bg-[#0B0B0D] text-white'
                    : 'border-[#E9E9EA] bg-white text-[#8D8E91]'
                }`}>
                  {p.available ? 'Available' : 'Hidden'}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                <p className="font-medium text-[#0B0B0D] leading-snug">{p.name}</p>
                {p.description && (
                  <p className="text-xs text-[#8D8E91] line-clamp-2">{p.description}</p>
                )}
                <p className="mt-auto pt-2 text-sm font-medium text-[#0B0B0D]">{fmt(p.price)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 border-t border-[#E9E9EA] px-3 py-2">
                <button onClick={() => setEditing(p)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#8D8E91] hover:text-[#0B0B0D] transition"
                  title="Edit">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => handleToggle(p)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#8D8E91] hover:text-[#0B0B0D] transition"
                  title={p.available ? 'Hide from store' : 'Show in store'}>
                  {p.available
                    ? <><ToggleRight size={14} className="text-[#0B0B0D]" /> Hide</>
                    : <><ToggleLeft size={14} /> Show</>
                  }
                </button>
                <button onClick={() => handleDelete(p)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-[#C9CACD] hover:text-red-500 transition"
                  title="Delete">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form overlay */}
      {editing !== null && (
        <ProductForm
          sellerId={user.id}
          product={editing === 'new' ? undefined : editing}
          onDone={handleDone}
          onClose={() => setEditing(null)}
        />
      )}
    </DashboardShell>
  )
}
