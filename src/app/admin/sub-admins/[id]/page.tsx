'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

const PERMISSIONS = [
  'stores.view', 'stores.manage', 'products.view', 'products.manage', 'products.bulk',
  'orders.view', 'orders.manage', 'customers.view', 'customers.manage',
  'partnerships.view', 'partnerships.manage', 'promotions.manage', 'analytics.view',
  'settings.manage', 'audit_logs.view', 'content.manage', 'reviews.manage',
]

export default function SubAdminDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sub-admin', id],
    queryFn: () => api.get(`/admin/sub-admins/${id}`).then(r => r.data.data),
  })

  useEffect(() => { if (data?.permissions) setSelected(data.permissions) }, [data])

  const save = useMutation({
    mutationFn: (payload: any) => api.patch(`/admin/sub-admins/${id}`, payload),
    onSuccess: () => {
      toast.success('Updated')
      qc.invalidateQueries({ queryKey: ['admin-sub-admin', id] })
      qc.invalidateQueries({ queryKey: ['admin-sub-admins'] })
    },
  })

  const resetPassword = useMutation({
    mutationFn: () => api.post(`/admin/sub-admins/${id}/reset-password`),
    onSuccess: () => toast.success('Password reset link sent'),
  })

  const toggle = (perm: string) => {
    setSelected(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm])
  }

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-gray-400">Loading…</div>
  if (!data) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/admin/sub-admins" className="text-sm text-gray-400 hover:text-orange-500">← Back to Sub Admins</Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{data.firstName} {data.lastName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data.email}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${data.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{data.isActive ? 'Active' : 'Deactivated'}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="font-bold text-sm text-gray-700 mb-4">Permissions</h2>
        <div className="grid sm:grid-cols-2 gap-2 mb-5">
          {PERMISSIONS.map(perm => (
            <label key={perm} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={selected.includes(perm)} onChange={() => toggle(perm)} className="w-4 h-4" />
              {perm}
            </label>
          ))}
        </div>
        <button onClick={() => save.mutate({ permissions: selected })} disabled={save.isPending}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: '#f68b1f' }}>
          {save.isPending ? 'Saving…' : 'Save Permissions'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex flex-wrap gap-3">
        <button onClick={() => resetPassword.mutate()} disabled={resetPassword.isPending}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          Send Password Reset Link
        </button>
        <button
          onClick={() => save.mutate({ isActive: !data.isActive })}
          disabled={save.isPending}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 ${data.isActive ? 'bg-red-100 text-red-700 hover:bg-red-600 hover:text-white' : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white'}`}>
          {data.isActive ? 'Deactivate Account' : 'Reactivate Account'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-sm text-gray-700 mb-4">Activity Log</h2>
        {data.activity?.length ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.activity.map((log: any) => (
              <div key={log.id} className="text-xs text-gray-600 border-b border-gray-50 pb-2">
                <span className="font-semibold">{log.action}</span> on {log.entityType} · {new Date(log.createdAt).toLocaleString('en-NG')}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No activity recorded yet.</p>
        )}
      </div>
    </div>
  )
}
