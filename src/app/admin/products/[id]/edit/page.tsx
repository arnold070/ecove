'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FormData {
  name: string
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
  isBestSeller: boolean
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => api.get(`/admin/products/${id}`).then(r => r.data.data),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-picker'],
    queryFn: () => api.get('/admin/categories').then(r => r.data.data),
  })
  const categories = categoriesData || []

  useEffect(() => {
    if (!data) return
    reset({
      name: data.name,
      categoryId: data.categoryId || '',
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      price: Number(data.price),
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      costPrice: data.costPrice ? Number(data.costPrice) : undefined,
      sku: data.sku || '',
      stock: data.stock,
      lowStockAlert: data.lowStockAlert,
      brand: data.brand || '',
      tags: (data.tags || []).join(', '),
      metaTitle: data.metaTitle || '',
      metaDescription: data.metaDescription || '',
      isFeatured: data.isFeatured,
      isBestSeller: data.isBestSeller,
    })
  }, [data, reset])

  const save = useMutation({
    mutationFn: (payload: any) => api.put(`/admin/products/${id}`, payload),
    onSuccess: () => {
      toast.success('Product updated')
      qc.invalidateQueries({ queryKey: ['admin-product', id] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    },
  })

  const onSubmit = (d: FormData) => {
    save.mutate({
      ...d,
      price: Number(d.price),
      comparePrice: d.comparePrice ? Number(d.comparePrice) : undefined,
      costPrice: d.costPrice ? Number(d.costPrice) : undefined,
      stock: Number(d.stock),
      lowStockAlert: d.lowStockAlert !== undefined ? Number(d.lowStockAlert) : undefined,
      categoryId: d.categoryId || undefined,
      tags: d.tags ? d.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    })
  }

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 text-sm text-gray-400">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/products" className="text-sm text-gray-400 hover:text-orange-500">← Back to Products</Link>
          <h1 className="text-xl font-extrabold text-gray-900 mt-2">Edit Product</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.vendor?.businessName}</p>
        </div>
        <Link href={`/products/${data?.slug}`} target="_blank" className="text-xs px-3 py-2 rounded-lg font-bold bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors">👁 View Product</Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Product Name *</label>
          <input {...register('name', { required: true, minLength: 2 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.name && <p className="text-xs text-red-500 mt-1">Product name is required</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Category</label>
          <select {...register('categoryId')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
            <option value="">— Select category —</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
            <input {...register('tags')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          </div>
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

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" {...register('isFeatured')} className="w-4 h-4" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" {...register('isBestSeller')} className="w-4 h-4" /> Best Seller
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={save.isPending}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50" style={{ background: '#f68b1f' }}>
            {save.isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')}
            className="px-6 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
