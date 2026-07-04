'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

const ROLE_TEMPLATE_NAMES = [
  'Inventory Manager', 'Order Manager', 'Operations Manager', 'Content Manager',
  'Customer Support', 'Vendor Relations Officer', 'Marketing Manager', 'Finance', 'Support',
]

interface InviteForm {
  firstName: string
  lastName: string
  email: string
  roleTemplate: string
}

export default function SubAdminsPage() {
  const qc = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sub-admins'],
    queryFn: () => api.get('/admin/sub-admins').then(r => r.data.data),
  })

  const invite = useMutation({
    mutationFn: (payload: InviteForm) => api.post('/admin/sub-admins', payload),
    onSuccess: () => {
      toast.success('Sub-admin invited — a password setup link was emailed to them')
      qc.invalidateQueries({ queryKey: ['admin-sub-admins'] })
      setShowInvite(false)
      reset()
    },
  })

  const admins = data || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Sub Admin Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">{admins.length} admin account(s)</p>
        </div>
        <button onClick={() => setShowInvite(v => !v)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: '#f68b1f' }}>
          + Invite Sub-Admin
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleSubmit(d => invite.mutate(d))} className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">First Name *</label>
              <input {...register('firstName', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Last Name *</label>
              <input {...register('lastName', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Email *</label>
              <input type="email" {...register('email', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
              {errors.email && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Role Template</label>
              <select {...register('roleTemplate')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
                <option value="">— Custom (no default permissions) —</option>
                {ROLE_TEMPLATE_NAMES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={invite.isPending}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: '#f68b1f' }}>
            {invite.isPending ? 'Inviting…' : 'Send Invite'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
        ) : admins.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-3">🛡️</div>
            <p className="font-semibold text-gray-600">No admin accounts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Role</th>
              <th className="px-5 py-3 text-left">Permissions</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-800">{a.firstName} {a.lastName}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{a.email}</td>
                  <td className="px-5 py-4 text-sm">{a.role === 'super_admin' ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Super Admin</span> : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Sub Admin</span>}</td>
                  <td className="px-5 py-4 text-xs text-gray-400 max-w-[240px] truncate">{a.role === 'super_admin' ? 'Full access' : (a.permissions?.join(', ') || '—')}</td>
                  <td className="px-5 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.isActive ? 'Active' : 'Deactivated'}</span></td>
                  <td className="px-5 py-4">
                    {a.role === 'admin' && (
                      <Link href={`/admin/sub-admins/${a.id}`} className="text-xs px-2.5 py-1.5 rounded-lg font-bold bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white transition-colors">Manage</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
