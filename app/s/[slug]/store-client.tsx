'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, CheckCircle2, ChevronRight,
  Clock, Home, MapPin, Minus, Package,
  Plus, ReceiptText, ShoppingBag, User,
  Wallet, X,
} from 'lucide-react'

import { Field } from '@/components/auth/field'
import { Input } from '@/components/ui/input'
import { createOrder } from '@/lib/orders/actions'
import type { Product } from '@/lib/products/actions'

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const DELIVERY_FEE_CENTS = 500   // $5.00

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CartItem { product: Product; quantity: number }
type View = 'home' | 'catalogue' | 'checkout' | 'done'
type Tab  = 'home' | 'orders'

interface SellerInfo {
  id:            string
  businessName:  string | null
  logoDataUrl:   string | null
  pickupAddress: string | null
  category:      string | null
  instagram:     string | null
  tiktok:        string | null
}

/** Order record stored in localStorage so customers can track their orders. */
interface LocalOrder {
  id:          string
  storeName:   string
  items:       { name: string; qty: number }[]
  total:       number          // cents
  placedAt:    number          // unix ms
  phone:       string
  address:     string
  status:      string          // mirrors the DB status
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmt(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/** Time-aware greeting shown to the customer — does NOT include any person's name. */
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ------------------------------------------------------------------ */
/* localStorage helpers for customer order history                    */
/* ------------------------------------------------------------------ */

function localOrdersKey(slug: string) { return `astra_orders_${slug}` }

function readLocalOrders(slug: string): LocalOrder[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(localOrdersKey(slug)) ?? '[]')
  } catch { return [] }
}

function saveLocalOrder(slug: string, order: LocalOrder) {
  if (typeof window === 'undefined') return
  const existing = readLocalOrders(slug)
  localStorage.setItem(localOrdersKey(slug), JSON.stringify([order, ...existing]))
}

/* ------------------------------------------------------------------ */
/* Nav items — only Home + Orders for the customer                    */
/* ------------------------------------------------------------------ */

const NAV_ITEMS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'home',   icon: Home,        label: 'Home'   },
  { id: 'orders', icon: ReceiptText, label: 'Orders' },
]

/* ------------------------------------------------------------------ */
/* Desktop sidebar                                                     */
/* ------------------------------------------------------------------ */

function StoreSidebar({
  seller, active, onTab, cartCount,
}: {
  seller: SellerInfo; active: Tab; onTab: (t: Tab) => void; cartCount: number
}) {
  const initials = (seller.businessName ?? 'S')[0]?.toUpperCase()

  return (
    <aside className="hidden lg:block lg:w-60 lg:shrink-0 lg:p-4">
      <div className="sticky top-4 flex h-[calc(100dvh-32px)] flex-col overflow-hidden rounded-2xl bg-[#E9E9EA]">

        {/* Store identity */}
        <div className="flex items-center gap-3 px-5 py-5">
          {seller.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seller.logoDataUrl} alt="" className="size-9 object-cover" />
          ) : (
            <div className="grid size-9 shrink-0 place-items-center border border-[#C9CACD] bg-white text-sm font-bold text-[#0B0B0D]">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#0B0B0D]">
              {seller.businessName ?? 'Store'}
            </p>
            {seller.category && (
              <p className="truncate text-xs text-[#8D8E91]">{seller.category}</p>
            )}
          </div>
        </div>

        <div className="mx-5 border-t border-[#C9CACD]" />

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const isActive = active === id
            return (
              <button key={id} type="button" onClick={() => onTab(id)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#0B0B0D]/10 text-[#0B0B0D]'
                    : 'text-[#8D8E91] hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]'
                }`}>
                <Icon size={16} className={`shrink-0 ${isActive ? 'text-[#0B0B0D]' : 'text-[#8D8E91]'}`} />
                <span>{label}</span>
                {id === 'orders' && cartCount > 0 && (
                  <span className="ml-auto grid size-5 place-items-center bg-[#0B0B0D] text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mx-5 border-t border-[#C9CACD]" />

        {/* Store info */}
        {seller.pickupAddress && (
          <div className="px-5 py-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-[#C9CACD]">Pickup</p>
            <p className="text-xs text-[#8D8E91]">{seller.pickupAddress}</p>
          </div>
        )}

        <div className="px-5 py-3">
          <p className="text-xs text-[#C9CACD]">Powered by Astra</p>
        </div>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile bottom nav                                                   */
/* ------------------------------------------------------------------ */

function BottomNav({ active, onTab, cartCount }: {
  active: Tab; onTab: (t: Tab) => void; cartCount: number
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-[#0B0B0D] lg:hidden"
      style={{ borderTop: '1px solid #1A1A1E' }}>
      <div className="flex w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => onTab(id)}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 py-3 transition ${
              active === id ? 'text-white' : 'text-[#3A3D44]'
            }`}>
            <Icon size={22} strokeWidth={active === id ? 2 : 1.5} />
            <span className="text-[10px] font-medium capitalize tracking-wide leading-none">{label}</span>
            {id === 'orders' && cartCount > 0 && (
              <span className="absolute right-[calc(50%-14px)] top-2 grid size-4 place-items-center bg-white text-[9px] font-bold text-[#0B0B0D]">
                {cartCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function StoreShell({ seller, active, onTab, cartCount, children }: {
  seller: SellerInfo; active: Tab; onTab: (t: Tab) => void
  cartCount: number; children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh bg-[#0B0B0D]" style={{ background: '#0B0B0D' }}>
      <StoreSidebar seller={seller} active={active} onTab={onTab} cartCount={cartCount} />
      <div className="flex flex-1 flex-col min-w-0">{children}</div>
      <BottomNav active={active} onTab={onTab} cartCount={cartCount} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Product card                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({ product, qty, onAdd, onRemove }: {
  product: Product; qty: number; onAdd: () => void; onRemove: () => void
}) {
  return (
    <div className="flex gap-4 border border-[#1A1A1E] bg-[#111113] p-4">
      <div className="size-20 shrink-0 overflow-hidden border border-[#1A1A1E] bg-[#0B0B0D]">
        {product.imageDataUrl
          ? <img src={product.imageDataUrl} alt={product.name} className="h-full w-full object-cover" /> // eslint-disable-line @next/next/no-img-element
          : <div className="flex h-full items-center justify-center text-[#3A3D44]"><Package size={22} /></div>
        }
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <p className="font-medium text-white leading-snug">{product.name}</p>
          {product.description && (
            <p className="mt-0.5 text-xs text-[#8D8E91] line-clamp-2">{product.description}</p>
          )}
        </div>
        <p className="text-sm font-medium text-white">
          {product.price > 0 ? fmt(product.price) : 'Price at delivery'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {qty > 0 ? (
          <>
            <button type="button" onClick={onRemove} aria-label="Remove"
              className="grid size-8 place-items-center border border-[#3A3D44] text-white hover:border-white transition">
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-sm font-medium text-white">{qty}</span>
            <button type="button" onClick={onAdd} aria-label="Add"
              className="grid size-8 place-items-center border border-white bg-white text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
              <Plus size={12} />
            </button>
          </>
        ) : (
          <button type="button" onClick={onAdd} aria-label="Add to cart"
            className="grid size-8 place-items-center border border-white bg-white text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
            <Plus size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Checkout schema                                                     */
/* ------------------------------------------------------------------ */

const checkoutSchema = z.object({
  customerName:    z.string().min(2, 'Enter your name'),
  customerPhone:   z.string().min(7, 'Enter your phone number'),
  deliveryAddress: z.string().min(5, 'Enter your delivery address'),
  note:            z.string().optional(),
})
type CheckoutValues = z.infer<typeof checkoutSchema>

/* ------------------------------------------------------------------ */
/* Payment modal                                                       */
/* ------------------------------------------------------------------ */

function PaymentModal({ total, onPay, onClose }: {
  total: number; onPay: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 lg:items-center">
      <div className="w-full max-w-md border border-[#1A1A1E] bg-[#111113] lg:mx-auto">
        <div className="flex justify-center pt-3 pb-2 lg:hidden">
          <div className="h-1 w-10 bg-[#3A3D44]" />
        </div>
        <div className="px-6 pb-8 pt-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-medium text-white">Payment</h2>
            <button type="button" onClick={onClose} className="text-[#8D8E91] hover:text-white transition">
              <X size={18} />
            </button>
          </div>
          <div className="mb-6 border border-[#1A1A1E] bg-[#0B0B0D] px-5 py-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">Total due</p>
            <p className="mt-1 text-3xl font-light text-white">{fmt(total)}</p>
          </div>
          <div className="mb-6 flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">Pay with</p>
            {/* Coming soon options */}
            {[
              { icon: <Wallet size={15} />, label: 'Credit / Debit card' },
              { icon: <span className="text-xs font-bold text-[#8D8E91]">M</span>, label: 'Mobile money' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center justify-between border border-[#1A1A1E] bg-[#0B0B0D] px-4 py-3.5 opacity-40">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center border border-[#3A3D44] text-[#8D8E91]">{icon}</div>
                  <span className="text-sm text-white">{label}</span>
                </div>
                <span className="text-xs text-[#3A3D44]">Coming soon</span>
              </div>
            ))}
            {/* Active: cash on delivery */}
            <button type="button" onClick={onPay}
              className="flex items-center justify-between border border-white bg-white px-4 py-3.5 hover:bg-[#E9E9EA] transition">
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center border border-[#C9CACD] text-[#0B0B0D]">
                  <span className="text-xs font-bold">$</span>
                </div>
                <span className="text-sm font-medium text-[#0B0B0D]">Cash on delivery</span>
              </div>
              <ChevronRight size={15} className="text-[#8D8E91]" />
            </button>
          </div>
          <p className="text-center text-xs text-[#3A3D44]">Online payment coming soon.</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Status badge for local orders                                       */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  pending:   { dot: 'bg-amber-400',  label: 'Waiting for rider' },
  assigned:  { dot: 'bg-blue-400',   label: 'Rider assigned'    },
  picked_up: { dot: 'bg-indigo-400', label: 'On the way'        },
  delivered: { dot: 'bg-emerald-400',label: 'Delivered'         },
  cancelled: { dot: 'bg-[#3A3D44]',  label: 'Cancelled'        },
}

/* ------------------------------------------------------------------ */
/* Main StoreClient                                                    */
/* ------------------------------------------------------------------ */

export function StoreClient({
  seller,
  products,
  slug,
}: {
  seller: SellerInfo
  products: Product[]
  slug: string
}) {
  const [cart, setCart]               = useState<CartItem[]>([])
  const [view, setView]               = useState<View>('home')
  const [tab, setTab]                 = useState<Tab>('home')
  const [showPayment, setShowPayment] = useState(false)
  const [doneOrderId, setDoneOrderId] = useState('')
  const [donePhone, setDonePhone]     = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([])

  // Load customer's past orders from localStorage on mount
  useEffect(() => {
    setLocalOrders(readLocalOrders(slug))
  }, [slug])

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
  })
  const { errors } = form.formState

  /* ---- Cart helpers ---- */
  const getQty   = (id: string) => cart.find((x) => x.product.id === id)?.quantity ?? 0
  const addToCart = (product: Product) =>
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === product.id)
      if (idx >= 0) return prev.map((x, i) => i === idx ? { ...x, quantity: x.quantity + 1 } : x)
      return [...prev, { product, quantity: 1 }]
    })
  const removeFromCart = (product: Product) =>
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === product.id)
      if (idx < 0) return prev
      const item = prev[idx]
      if (item.quantity <= 1) return prev.filter((_, i) => i !== idx)
      return prev.map((x, i) => i === idx ? { ...x, quantity: x.quantity - 1 } : x)
    })

  const cartSubtotal = cart.reduce((s, it) => s + it.product.price * it.quantity, 0)
  const cartTotal    = cartSubtotal + DELIVERY_FEE_CENTS
  const cartCount    = cart.reduce((s, it) => s + it.quantity, 0)

  /* ---- Place order ---- */
  const placeOrder = async () => {
    setSubmitting(true)
    setServerError(null)
    const values = form.getValues()
    const res = await createOrder({
      sellerId:        seller.id,
      customerName:    values.customerName,
      customerPhone:   values.customerPhone,
      deliveryAddress: values.deliveryAddress,
      note:            values.note,
      items: cart.map((it) => ({
        productName: it.product.name,
        quantity:    it.quantity,
        unitPrice:   it.product.price,
      })),
    })
    setSubmitting(false)
    if (!res.ok) { setServerError(res.error); return }

    // Persist order locally so the customer can track it
    const localOrder: LocalOrder = {
      id:        res.order.id,
      storeName: seller.businessName ?? slug,
      items:     cart.map((it) => ({ name: it.product.name, qty: it.quantity })),
      total:     cartTotal,
      placedAt:  Date.now(),
      phone:     values.customerPhone,
      address:   values.deliveryAddress,
      status:    'pending',
    }
    saveLocalOrder(slug, localOrder)
    setLocalOrders((prev) => [localOrder, ...prev])

    setShowPayment(false)
    setDoneOrderId(res.order.id)
    setDonePhone(values.customerPhone)
    setCart([])
    form.reset()
    setView('done')
    setTab('home')
  }

  /* ---- Tab navigation ---- */
  const handleTab = (t: Tab) => {
    setTab(t)
    if (t === 'home')   setView('home')
    if (t === 'orders') setView('home')   // orders shown on home after switching tab
  }

  /* ============================================================ */
  /* DONE                                                         */
  /* ============================================================ */
  if (view === 'done') {
    return (
      <StoreShell seller={seller} active="home" onTab={handleTab} cartCount={0}>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 pb-24 text-center lg:pb-12">
          <div className="mb-6 grid size-16 place-items-center border border-[#3A3D44] bg-[#111113]">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-light text-white">Order placed</h2>
          <p className="mt-3 max-w-xs text-sm text-[#8D8E91]">
            Your order is confirmed and a rider will be assigned shortly.
            {donePhone && (
              <> You&rsquo;ll be contacted on{' '}
                <span className="font-medium text-white">{donePhone}</span>.
              </>
            )}
          </p>
          {doneOrderId && (
            <p className="mt-3 text-xs text-[#3A3D44]">
              Order reference: <span className="font-mono text-[#8D8E91]">{doneOrderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
          <div className="mt-8 flex gap-3">
            <button type="button"
              onClick={() => { setView('home'); setTab('home') }}
              className="border border-[#3A3D44] px-6 py-3 text-xs font-medium uppercase tracking-widest text-white hover:border-white transition">
              Back to store
            </button>
            <button type="button"
              onClick={() => { setView('home'); setTab('orders') }}
              className="border border-white bg-white px-6 py-3 text-xs font-medium uppercase tracking-widest text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
              Track order
            </button>
          </div>
        </div>
      </StoreShell>
    )
  }

  /* ============================================================ */
  /* CHECKOUT                                                     */
  /* ============================================================ */
  if (view === 'checkout') {
    return (
      <StoreShell seller={seller} active="orders" onTab={handleTab} cartCount={cartCount}>
        <div className="flex items-center gap-3 border-b border-[#1A1A1E] px-4 py-4">
          <button type="button" onClick={() => setView('catalogue')}
            className="text-[#8D8E91] hover:text-white transition">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-medium text-white">Your details</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-5 lg:pb-8 lg:max-w-2xl">
          {/* Order summary */}
          <div className="mb-6 border border-[#1A1A1E] bg-[#111113] px-5 py-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">Order summary</p>
            <div className="flex flex-col gap-2">
              {cart.map((it) => (
                <div key={it.product.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white">
                    {it.product.name}
                    <span className="ml-1 text-[#8D8E91]">× {it.quantity}</span>
                  </span>
                  <span className="font-medium text-white">
                    {it.product.price > 0 ? fmt(it.product.price * it.quantity) : '—'}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-[#1A1A1E] pt-2 text-sm text-[#8D8E91]">
                <span>Delivery fee</span>
                <span>{fmt(DELIVERY_FEE_CENTS)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#3A3D44] pt-2 text-sm font-medium text-white">
                <span>Total</span>
                <span>{fmt(cartTotal)}</span>
              </div>
            </div>
          </div>

          <form id="checkout-form"
            onSubmit={form.handleSubmit(() => setShowPayment(true))}
            className="flex flex-col gap-5" noValidate>
            {serverError && (
              <p className="border border-[#3A3D44] bg-[#111113] px-4 py-3 text-sm text-white">
                {serverError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name" htmlFor="customerName" error={errors.customerName?.message}>
                <Input id="customerName" autoComplete="name" placeholder="Amara Diallo"
                  aria-invalid={!!errors.customerName} {...form.register('customerName')}
                  className="border-[#3A3D44] bg-[#111113] text-white placeholder:text-[#3A3D44] focus:border-white focus:ring-0" />
              </Field>
              <Field label="Phone number" htmlFor="customerPhone" error={errors.customerPhone?.message}>
                <Input id="customerPhone" type="tel" autoComplete="tel" placeholder="+1 555 0100"
                  aria-invalid={!!errors.customerPhone} {...form.register('customerPhone')}
                  className="border-[#3A3D44] bg-[#111113] text-white placeholder:text-[#3A3D44] focus:border-white focus:ring-0" />
              </Field>
            </div>
            <Field label="Delivery address" htmlFor="deliveryAddress" error={errors.deliveryAddress?.message}>
              <Input id="deliveryAddress" autoComplete="street-address" placeholder="Street, city, area"
                aria-invalid={!!errors.deliveryAddress} {...form.register('deliveryAddress')}
                className="border-[#3A3D44] bg-[#111113] text-white placeholder:text-[#3A3D44] focus:border-white focus:ring-0" />
            </Field>
            <Field label="Note for rider" htmlFor="note" optional>
              <Input id="note" placeholder="Leave at the gate, ring twice…" {...form.register('note')}
                className="border-[#3A3D44] bg-[#111113] text-white placeholder:text-[#3A3D44] focus:border-white focus:ring-0" />
            </Field>
            {/* Desktop submit */}
            <button type="submit" disabled={submitting}
              className="hidden lg:flex items-center justify-between border border-white bg-white px-6 py-4 text-sm font-medium text-[#0B0B0D] hover:bg-[#E9E9EA] disabled:opacity-60 transition">
              <span>{submitting ? 'Placing order…' : 'Proceed to payment'}</span>
              <span className="font-bold">{fmt(cartTotal)}</span>
            </button>
          </form>
        </div>

        {/* Mobile sticky button */}
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[#1A1A1E] bg-[#0B0B0D] px-4 py-4 lg:hidden">
          <button type="submit" form="checkout-form" disabled={submitting}
            className="flex w-full items-center justify-between border border-white bg-white px-6 py-4 text-sm font-medium text-[#0B0B0D] hover:bg-[#E9E9EA] disabled:opacity-60 transition">
            <span>{submitting ? 'Placing order…' : 'Proceed to payment'}</span>
            <span className="font-bold">{fmt(cartTotal)}</span>
          </button>
        </div>

        {showPayment && (
          <PaymentModal total={cartTotal} onPay={placeOrder} onClose={() => setShowPayment(false)} />
        )}
      </StoreShell>
    )
  }

  /* ============================================================ */
  /* CATALOGUE                                                    */
  /* ============================================================ */
  if (view === 'catalogue') {
    return (
      <StoreShell seller={seller} active="orders" onTab={handleTab} cartCount={cartCount}>
        <div className="flex items-center gap-3 border-b border-[#1A1A1E] px-4 py-4">
          <button type="button" onClick={() => { setView('home'); setTab('home') }}
            className="text-[#8D8E91] hover:text-white transition">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-base font-medium text-white">Menu</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40 lg:pb-8 lg:max-w-2xl">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package size={28} className="mb-4 text-[#3A3D44]" />
              <p className="text-sm font-medium text-white">No products yet</p>
              <p className="mt-1 text-sm text-[#8D8E91]">Check back soon.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} qty={getQty(p.id)}
                  onAdd={() => addToCart(p)} onRemove={() => removeFromCart(p)} />
              ))}
            </div>
          )}
        </div>

        {cartCount > 0 && (
          <>
            {/* Mobile cart bar */}
            <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-2 lg:hidden">
              <button type="button" onClick={() => setView('checkout')}
                className="flex w-full items-center justify-between border border-white bg-white px-5 py-4 text-sm font-medium text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{fmt(cartTotal)}</span>
                  <span className="text-xs text-[#8D8E91]">incl. delivery</span>
                </div>
              </button>
            </div>
            {/* Desktop cart bar */}
            <div className="hidden lg:block border-t border-[#1A1A1E] px-4 py-4">
              <button type="button" onClick={() => setView('checkout')}
                className="flex w-full max-w-2xl items-center justify-between border border-white bg-white px-6 py-4 text-sm font-medium text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{fmt(cartTotal)}</span>
                  <span className="text-xs text-[#8D8E91]">incl. delivery</span>
                </div>
              </button>
            </div>
          </>
        )}
      </StoreShell>
    )
  }

  /* ============================================================ */
  /* HOME — customer-facing storefront                           */
  /* ============================================================ */

  const showOrders = tab === 'orders'

  return (
    <StoreShell seller={seller} active={tab} onTab={handleTab} cartCount={cartCount}>
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-5 lg:pb-8">

        {showOrders ? (
          /* ---- ORDERS TAB ---- */
          <>
            <div className="mb-5">
              <h2 className="text-xl font-light text-white">Your orders</h2>
              <p className="mt-0.5 text-sm text-[#8D8E91]">
                Orders you&rsquo;ve placed at {seller.businessName ?? 'this store'}.
              </p>
            </div>

            {localOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ReceiptText size={28} className="mb-4 text-[#3A3D44]" />
                <p className="text-sm font-medium text-white">No orders yet</p>
                <p className="mt-1 text-sm text-[#8D8E91]">
                  Your orders will appear here after you place one.
                </p>
                <button type="button"
                  onClick={() => { setView('catalogue'); setTab('orders') }}
                  className="mt-5 border border-white bg-white px-6 py-3 text-xs font-medium uppercase tracking-widest text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
                  Browse menu
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {localOrders.map((o) => {
                  const st = STATUS_STYLES[o.status] ?? STATUS_STYLES.pending
                  return (
                    <div key={o.id} className="border border-[#1A1A1E] bg-[#111113] px-4 py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-xs text-[#8D8E91]">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="font-medium text-white">{fmt(o.total)}</span>
                      </div>
                      <div className="mb-3 flex flex-col gap-1 text-xs text-[#8D8E91]">
                        {o.items.map((it) => (
                          <span key={it.name}>{it.name} × {it.qty}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-[#1A1A1E] pt-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`size-2 rounded-full ${st.dot}`} />
                          <span className="text-[#8D8E91]">{st.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#3A3D44]">
                          <Clock size={11} />
                          {fmtDate(o.placedAt)}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs text-[#3A3D44]">
                        <MapPin size={11} />
                        <span className="truncate">{o.address}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          /* ---- HOME TAB — customer storefront ---- */
          <>
            {/* Greeting — store name, not the seller's personal name */}
            <div className="mb-6">
              <p className="text-sm text-[#8D8E91]">{greeting()}</p>
              <h1 className="mt-1 text-2xl font-light leading-tight text-white">
                Welcome to{' '}
                <span className="font-medium">{seller.businessName ?? 'this store'}</span>
              </h1>
              {seller.category && (
                <p className="mt-1 text-xs text-[#8D8E91]">{seller.category}</p>
              )}
            </div>

            {/* Pickup address */}
            {seller.pickupAddress && (
              <div className="mb-5 flex items-start gap-2 border border-[#1A1A1E] bg-[#111113] px-4 py-3">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#8D8E91]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#3A3D44]">Pickup from</p>
                  <p className="text-sm text-[#8D8E91]">{seller.pickupAddress}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <button type="button"
              onClick={() => { setView('catalogue'); setTab('orders') }}
              className="mb-6 flex w-full items-center justify-between border border-white bg-white px-5 py-4 text-sm font-medium text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} />
                <span>
                  {products.length > 0
                    ? `Browse ${products.length} item${products.length !== 1 ? 's' : ''}`
                    : 'Browse menu'
                  }
                </span>
              </div>
              <ChevronRight size={16} />
            </button>

            {/* Featured products preview (first 3) */}
            {products.length > 0 && (
              <>
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                  Featured
                </p>
                <div className="flex flex-col gap-3">
                  {products.slice(0, 3).map((p) => (
                    <ProductCard key={p.id} product={p} qty={getQty(p.id)}
                      onAdd={() => addToCart(p)} onRemove={() => removeFromCart(p)} />
                  ))}
                  {products.length > 3 && (
                    <button type="button"
                      onClick={() => { setView('catalogue'); setTab('orders') }}
                      className="border border-[#1A1A1E] bg-[#111113] py-3 text-xs text-[#8D8E91] hover:border-[#3A3D44] hover:text-white transition">
                      View all {products.length} items
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Recent orders (if any) */}
            {localOrders.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#8D8E91]">
                    Your recent orders
                  </p>
                  <button type="button" onClick={() => setTab('orders')}
                    className="text-xs text-[#3A3D44] hover:text-[#8D8E91] transition">
                    View all
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {localOrders.slice(0, 2).map((o) => {
                    const st = STATUS_STYLES[o.status] ?? STATUS_STYLES.pending
                    return (
                      <div key={o.id} className="flex items-center justify-between border border-[#1A1A1E] bg-[#111113] px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">
                            #{o.id.slice(0, 8).toUpperCase()}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#8D8E91]">
                            <span className={`size-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white">{fmt(o.total)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile cart bar when items in cart */}
      {cartCount > 0 && view === 'home' && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-2 lg:hidden">
          <button type="button" onClick={() => { setView('catalogue'); setTab('orders') }}
            className="flex w-full items-center justify-between border border-white bg-white px-5 py-3 text-sm font-medium text-[#0B0B0D] hover:bg-[#E9E9EA] transition">
            <div className="flex items-center gap-2">
              <ShoppingBag size={15} />
              <span>{cartCount} in cart</span>
            </div>
            <span className="font-bold">{fmt(cartTotal)}</span>
          </button>
        </div>
      )}
    </StoreShell>
  )
}
