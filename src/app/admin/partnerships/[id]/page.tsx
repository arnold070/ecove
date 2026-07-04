'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

const STATUSES = ['new', 'reviewing', 'contacted', 'converted', 'rejected']

export default function PartnershipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-partnership', id],
    queryFn: () => api.get(`/admin/partnerships/${id}`).then(r => r.data.data),
  })

  useEffect(() => { if (data?.adminNote) setNote(data.adminNote) }, [data])

  const update = useMutation({
    mutationFn: (status: string) => api.patch(`/admin/partnerships/${id}`, { status, adminNote: note }),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['admin-partnership', id] })
      qc.invalidateQueries({ queryKey: ['admin-partnerships'] })
    },
  })

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-gray-400">Loading…</div>
  if (!data) return null

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value || '—'}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin/partnerships" className="text-sm text-gray-400 hover:text-orange-500">← Back to Partnership Requests</Link>
      <h1 className="text-xl font-extrabold text-gray-900 mt-2 mb-6">{data.businessName}</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 mb-5">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Contact Person" value={data.contactPerson} />
          <Field label="Email" value={data.email} />
          <Field label="Phone" value={data.phone} />
          <Field label="Location" value={data.location} />
          <Field label="Business Type" value={data.businessType} />
          <Field label="Industry" value={data.industry} />
          <Field label="Number of Products" value={data.numberOfProducts} />
          <Field label="Estimated Monthly Capacity" value={data.estimatedMonthlyCapacity} />
          <Field label="Website" value={data.website} />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Social Media Links</p>
          <p className="text-sm text-gray-800">{data.socialLinks?.length ? data.socialLinks.join(', ') : '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Short Description</p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.shortDescription}</p>
        </div>
        {data.message && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Message</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.message}</p>
          </div>
        )}
        {data.companyProfileUrl && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Company Profile</p>
            <a href={data.companyProfileUrl} target="_blank" rel="noreferrer" className="text-sm text-orange-500 font-semibold hover:underline">View uploaded file →</a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-sm text-gray-700 mb-3">Review</h2>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Internal Note</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 mb-4" />
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => update.mutate(s)} disabled={update.isPending}
              className={`text-xs px-3 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 ${data.status === s ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white'}`}
              style={data.status === s ? { background: '#f68b1f' } : {}}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
