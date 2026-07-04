'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/apiClient'

const ENTITY_TYPES = ['', 'vendor', 'product', 'order', 'coupon', 'partner_inquiry', 'user']

export default function AuditLogsPage() {
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', entityType, page],
    queryFn: () => api.get(`/admin/audit-logs?page=${page}&limit=30${entityType ? `&entityType=${entityType}` : ''}`).then(r => r.data),
  })

  const logs = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-400 mt-0.5">{pagination?.total || 0} recorded actions</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {ENTITY_TYPES.map(t => (
          <button key={t} onClick={() => { setEntityType(t); setPage(1) }}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${entityType === t ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}
            style={entityType === t ? { background: '#f68b1f' } : {}}>
            {t || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-3">📜</div>
            <p className="font-semibold text-gray-600">No audit log entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">Entity</th>
                <th className="px-5 py-3 text-left">Actor Role</th>
                <th className="px-5 py-3 text-left">When</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">{log.action}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{log.entityType} <span className="text-xs text-gray-400">({log.entityId})</span></td>
                    <td className="px-5 py-4 text-sm text-gray-500">{log.actorRole || '—'}</td>
                    <td className="px-5 py-4 text-xs text-gray-400">{new Date(log.createdAt).toLocaleString('en-NG')}</td>
                  </tr>
                ))}
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
