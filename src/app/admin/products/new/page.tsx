'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FormData {
  name: string
  vendorId: string
  categoryId?: string
  description?: string
  shortDescription?: string
  price: number
  comparePrice?: number
  costPrice?: number
  sku?: string
  stock: number
  lowStockAlert?: number
  brand?: string
  tags?: string
  metaTitle?: string
  metaDescription?: string
  isFeatured: boolean
}

export default function NewProductPage() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { isFeatured: false },
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const { data: vendorsData } = useQuery({
    queryKey: ['admin-vendors-picker'],
    queryFn: () => api.get('/admin/vendors?limit=100').then(r => r.data),
  })
  const stores = vendorsData?.data || []

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-picker'],
    queryFn: () => api.get('/admin/categories').then(r => r.data.data),
  })
  const categories = categoriesData || []

  const uploadImages = async (files: FileList) => {
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'products')
        const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        uploaded.push(data.data.url)
      }
      setImages(prev => [...prev, ...uploaded])
    } catch {
      toast.error('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/admin/products', payload),
    onSuccess: (res) => {
      toast.success('Product created')
      router.push(`/admin/products/${res.data.data.id}/edit`)
    },
  })

  const onSubmit = (d: FormData) => {
    create.mutate({
      ...d,
      price: Number(d.price),
      comparePrice: d.comparePrice ? Number(d.comparePrice) : undefined,
      costPrice: d.costPrice ? Number(d.costPrice) : undefined,
      stock: Number(d.stock),
      lowStockAlert: d.lowStockAlert ? Number(d.lowStockAlert) : undefined,
      categoryId: d.categoryId || undefined,
      tags: d.tags ? d.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      images,
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/products" className="text-sm text-gray-400 hover:text-orange-500">← Back to Products</Link>
        <h1 className="text-xl font-extrabold text-gray-900 mt-2">New Product</h1>
        <p className="text-sm text-gray-400 mt-0.5">Products created here go live immediately.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Product Name *</label>
          <input {...register('name', { required: true, minLength: 2 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.name && <p className="text-xs text-red-500 mt-1">Product name is required</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Store *</label>
            <select {...register('vendorId', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
              <option value="">— Select store —</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.businessName}</option>)}
            </select>
            {errors.vendorId && <p className="text-xs text-red-500 mt-1">Select which store this product belongs to</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Category</label>
            <select {...register('categoryId')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
              <option value="">— Select category —</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Short Description</label>
          <input {...register('shortDescription')} maxLength={160} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
          <textarea {...register('description')} rows={4} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Price (₦) *</label>
            <input type="number" step="0.01" {...register('price', { required: true, min: 0.01 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Compare Price (₦)</label>
            <input type="number" step="0.01" {...register('comparePrice')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Cost Price (₦)</label>
            <input type="number" step="0.01" {...register('costPrice')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Stock *</label>
            <input type="number" {...register('stock', { required: true, min: 0 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Low Stock Alert</label>
            <input type="number" {...register('lowStockAlert')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">SKU</label>
            <input {...register('sku')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Brand</label>
            <input {...register('brand')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input {...register('tags')} placeholder="wireless, bluetooth" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Images</label>
          <input type="file" accept="image/*" multiple aria-label="Upload product images" onChange={e => e.target.files && uploadImages(e.target.files)} className="text-sm" />
          {uploading && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map(url => <img key={url} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />)}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">SEO Metadata</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Meta Title</label>
              <input {...register('metaTitle')} maxLength={70} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Meta Description</label>
              <input {...register('metaDescription')} maxLength={160} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" {...register('isFeatured')} className="w-4 h-4" /> Featured product
        </label>

        <button type="submit" disabled={create.isPending}
          className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50" style={{ background: '#f68b1f' }}>
          {create.isPending ? 'Creating…' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
