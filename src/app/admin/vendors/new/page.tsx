'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FormData {
  businessName: string
  description?: string
  tagline?: string
  phone: string
  whatsapp?: string
  city: string
  state: string
  address: string
  managedById?: string
  isVisible: boolean
  isFeatured: boolean
  categoryTags?: string
  commissionRate?: number
}

export default function NewStorePage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { isVisible: true, isFeatured: false },
  })
  const [logoUrl, setLogoUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)

  const { data: managersData } = useQuery({
    queryKey: ['admin-sub-admins-picker'],
    queryFn: () => api.get('/admin/sub-admins').then(r => r.data).catch(() => ({ data: [] })),
  })
  const managers = managersData?.data || []

  const uploadImage = async (file: File, folder: 'vendor-logo' | 'vendor-banner') => {
    setUploading(folder === 'vendor-logo' ? 'logo' : 'banner')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (folder === 'vendor-logo') setLogoUrl(data.data.url)
      else setBannerUrl(data.data.url)
    } catch {
      toast.error('Image upload failed.')
    } finally {
      setUploading(null)
    }
  }

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/admin/vendors', payload),
    onSuccess: (res) => {
      toast.success('Store created')
      router.push(`/admin/vendors/${res.data.data.id}/edit`)
    },
  })

  const onSubmit = (d: FormData) => {
    create.mutate({
      ...d,
      logoUrl: logoUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      managedById: d.managedById || undefined,
      commissionRate: d.commissionRate ? Number(d.commissionRate) : undefined,
      categoryTags: d.categoryTags ? d.categoryTags.split(',').map(s => s.trim()).filter(Boolean) : [],
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/vendors" className="text-sm text-gray-400 hover:text-orange-500">← Back to Stores</Link>
        <h1 className="text-xl font-extrabold text-gray-900 mt-2">Create Store</h1>
        <p className="text-sm text-gray-400 mt-0.5">Stores are created and managed internally by Ecove admins.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Business Name *</label>
            <input {...register('businessName', { required: true, minLength: 2 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            {errors.businessName && <p className="text-xs text-red-500 mt-1">Business name is required</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Tagline</label>
            <input {...register('tagline')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
          <textarea {...register('description')} rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone *</label>
            <input {...register('phone', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">WhatsApp</label>
            <input {...register('whatsapp')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">City *</label>
            <input {...register('city', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">State *</label>
            <input {...register('state', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Address *</label>
          <input {...register('address', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Logo</label>
            <input type="file" accept="image/*" aria-label="Upload store logo" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'vendor-logo')} className="text-sm" />
            {uploading === 'logo' && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
            {logoUrl && <img src={logoUrl} alt="Logo preview" className="mt-2 w-16 h-16 rounded-xl object-cover" />}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Banner</label>
            <input type="file" accept="image/*" aria-label="Upload store banner" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'vendor-banner')} className="text-sm" />
            {uploading === 'banner' && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
            {bannerUrl && <img src={bannerUrl} alt="Banner preview" className="mt-2 w-full h-16 rounded-xl object-cover" />}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Assigned Manager</label>
            <select {...register('managedById')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
              <option value="">— Unassigned —</option>
              {managers.map((m: any) => (
                <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Store Categories <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input {...register('categoryTags')} placeholder="Electronics, Fashion" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Commission Rate (%)</label>
          <input type="number" step="0.01" {...register('commissionRate')} className="w-full md:w-48 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" {...register('isVisible')} className="w-4 h-4" /> Visible on storefront
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" {...register('isFeatured')} className="w-4 h-4" /> Featured store
          </label>
        </div>

        <button type="submit" disabled={create.isPending}
          className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50" style={{ background: '#f68b1f' }}>
          {create.isPending ? 'Creating…' : 'Create Store'}
        </button>
      </form>
    </div>
  )
}
