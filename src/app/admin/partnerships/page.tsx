'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/apiClient'
import Link from 'next/link'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:        { bg: '#dbeafe', color: '#1d4ed8' },
  reviewing:  { bg: '#fef3c7', color: '#92400e' },
  contacted:  { bg: '#e0e7ff', color: '#4338ca' },
  converted:  { bg: '#dcfce7', color: '#15803d' },
  rejected:   { bg: '#fee2e2', color: '#991b1b' },
}

export default function PartnershipsPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-partnerships', status, page],
    queryFn: () => api.get(`/admin/partnerships?page=${page}&limit=20${status ? `&status=${status}` : ''}`).then(r => r.data),
  })

  const inquiries = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Partnership Requests</h1>
        <p className="text-sm text-gray-400 mt-0.5">{pagination?.total || 0} inquiries submitted via Partner With Us</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[['', 'All'], ['new', 'New'], ['reviewing', 'Reviewing'], ['contacted', 'Contacted'], ['converted', 'Converted'], ['rejected', 'Rejected']].map(([val, label]) => (
          <button key={val} onClick={() => { setStatus(val); setPage(1) }}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${status === val ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
            style={status === val ? { background: '#f68b1f' } : {}}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-3">🤝</div>
            <p className="font-semibold text-gray-600">No partnership inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Business</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Submitted</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {inquiries.map((p: any) => {
                  const s = STATUS_STYLE[p.status] || { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{p.businessName}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{p.contactPerson}<br/><span className="text-xs text-gray-400">{p.email}</span></td>
                      <td className="px-5 py-4 text-sm text-gray-500">{p.businessType}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{p.location}</td>
                      <td className="px-5 py-4"><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{p.status}</span></td>
                      <td className="px-5 py-4 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-NG')}</td>
                      <td className="px-5 py-4">
                        <Link href={`/admin/partnerships/${p.id}`} className="text-xs px-2.5 py-1.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white transition-colors">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Page {page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-orange-400">← Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.totalPages} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:border-orange-400">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
