'use client'

import { useCallback, useEffect, useState } from 'react'
import { Mail } from 'lucide-react'

import { useRequireAdmin } from '@/components/auth/guards'
import { PageLoader } from '@/components/auth/page-loader'
import { AdminShell } from '@/components/admin/admin-shell'
import { getContactEnquiries, updateEnquiryStatus } from '@/lib/contact/actions'
import type { ContactEnquiry } from '@/lib/contact/actions'
import { cn } from '@/lib/utils'

function fmtDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_STYLES = {
  new:       'border-amber-200 bg-amber-50 text-amber-700',
  contacted: 'border-[#3A3D44] bg-[#0B0B0D] text-[#E9E9EA]',
  dismissed: 'border-[#E9E9EA] bg-white text-[#C9CACD]',
}

export default function AdminEnquiriesPage() {
  const { user, loading } = useRequireAdmin()
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([])
  const [fetching,  setFetching]  = useState(true)

  const load = useCallback(async () => {
    setFetching(true)
    setEnquiries(await getContactEnquiries())
    setFetching(false)
  }, [])

  useEffect(() => { if (user) load() }, [user, load])

  if (loading || !user || user.role !== 'admin') return <PageLoader />

  const handleStatus = async (id: string, status: 'new' | 'contacted' | 'dismissed') => {
    await updateEnquiryStatus(id, status)
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  const newCount = enquiries.filter(e => e.status === 'new').length

  return (
    <AdminShell user={user}>
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-[#0B0B0D]">Enquiries</h1>
          <p className="mt-0.5 text-sm text-[#8D8E91]">Delivery company applications from the website.</p>
        </div>
        {newCount > 0 && (
          <span className="border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            {newCount} new
          </span>
        )}
      </div>

      {fetching ? (
        <div className="flex items-center gap-3 border border-[#E9E9EA] bg-white px-6 py-10 text-sm text-[#8D8E91]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#E9E9EA] border-t-[#0B0B0D]" />
          Loading enquiries…
        </div>
      ) : enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-[#E9E9EA] bg-white px-6 py-16 text-center">
          <Mail size={28} className="mb-4 text-[#C9CACD]" />
          <p className="font-medium text-[#0B0B0D]">No enquiries yet</p>
          <p className="mt-1 text-sm text-[#8D8E91]">Delivery company submissions will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enquiries.map(e => (
            <div key={e.id} className="border border-[#E9E9EA] bg-white">
              <div className="flex flex-col gap-2 border-b border-[#E9E9EA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#0B0B0D]">{e.companyName}</p>
                  <p className="text-xs text-[#8D8E91]">{e.name} · {e.contact}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('inline-flex items-center border px-2.5 py-1 text-xs font-medium capitalize', STATUS_STYLES[e.status])}>
                    {e.status}
                  </span>
                  <span className="text-xs text-[#C9CACD]">{fmtDate(e.createdAt)}</span>
                </div>
              </div>
              {e.message && (
                <div className="px-5 py-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#C9CACD]">Message</p>
                  <p className="mt-1 text-sm text-[#8D8E91]">{e.message}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 border-t border-[#E9E9EA] px-5 py-3">
                {e.contact.includes('@') && (
                  <a href={`mailto:${e.contact}?subject=Re: Astra delivery partner enquiry — ${e.companyName}`}
                    className="border border-[#E9E9EA] px-3 py-1.5 text-xs font-medium text-[#0B0B0D] hover:bg-[#0B0B0D] hover:text-white transition">
                    Reply by email
                  </a>
                )}
                <button disabled={e.status === 'contacted'}
                  onClick={() => handleStatus(e.id, 'contacted')}
                  className="border border-[#E9E9EA] px-3 py-1.5 text-xs font-medium text-[#0B0B0D] hover:bg-[#F9F9FA] disabled:cursor-not-allowed disabled:opacity-30 transition">
                  Mark contacted
                </button>
                <button
                  onClick={() => handleStatus(e.id, e.status === 'dismissed' ? 'new' : 'dismissed')}
                  className="ml-auto border border-[#E9E9EA] px-3 py-1.5 text-xs font-medium text-[#C9CACD] hover:border-red-200 hover:text-red-500 transition">
                  {e.status === 'dismissed' ? 'Restore' : 'Dismiss'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  )
}
