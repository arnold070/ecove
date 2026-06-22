'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '@/lib/apiClient'
import toast from 'react-hot-toast'
import Image from 'next/image'
import type { Banner } from '@/types'

const POSITIONS = [
  {
    value: 'hero_slider',
    label: 'Hero Slider',
    icon: '🖼️',
    desc: 'Full-width animated banner in the main hero carousel. Supports background image + text overlay.',
  },
  {
    value: 'side_card_left',
    label: 'Side Card (Top)',
    icon: '📌',
    desc: 'Top card in the right promo column beside the hero (desktop only). Shows image or colour gradient.',
  },
  {
    value: 'side_card_right',
    label: 'Side Card (Middle)',
    icon: '📌',
    desc: 'Middle card in the right promo column beside the hero (desktop only).',
  },
  {
    value: 'full_width',
    label: 'Full-Width Campaign',
    icon: '📢',
    desc: 'Large banner spanning the full width between the trust strip and flash sale. Perfect for promotions.',
  },
  {
    value: 'dual_banner',
    label: 'Dual Banner',
    icon: '🗂️',
    desc: 'Two banners placed side by side in the campaign section. Uses pairs — upload two for best results.',
  },
]

export default function AdminBannersPage() {
  const qc = useQueryClient()
  const [editing,   setEditing]   = useState<Banner | null>(null)
  const [showForm,  setShowForm]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['admin-banners'],
    queryFn: () => api.get('/admin/banners').then(r => r.data.data),
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm<any>({
    defaultValues: { isActive: true, displayOrder: 0 },
  })

  const imageUrl = watch('imageUrl')
  const bgColor  = watch('bgColor')

  const save = useMutation({
    mutationFn: (data: any) =>
      editing
        ? api.put('/admin/banners', { id: editing.id, ...data })
        : api.post('/admin/banners', data),
    onSuccess: () => {
      toast.success(editing ? 'Banner updated' : 'Banner created')
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
      setEditing(null); setShowForm(false); reset()
    },
  })

  const deleteBanner = useMutation({
    mutationFn: (id: string) => api.delete('/admin/banners', { data: { id } }),
    onSuccess: () => {
      toast.success('Banner deleted')
      qc.invalidateQueries({ queryKey: ['admin-banners'] })
    },
  })

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'banners')
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setValue('imageUrl', res.data.data.url)
      toast.success('Image uploaded successfully')
    } catch {
      toast.error('Upload failed — check file type and size (max 5 MB)')
    } finally {
      setUploading(false)
    }
  }

  const openEdit = (b: Banner) => {
    setEditing(b)
    setShowForm(true)
    reset({
      title: b.title, subtitle: b.subtitle || '', ctaText: b.ctaText || '',
      ctaLink: b.ctaLink || '', imageUrl: b.imageUrl || '', bgColor: b.bgColor || '',
      position: b.position, displayOrder: b.displayOrder, isActive: b.isActive,
    })
  }

  const openNew = () => {
    setEditing(null)
    reset({ isActive: true, displayOrder: 0, position: 'hero_slider' })
    setShowForm(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* ── Page header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Upload advert images and manage homepage promotional banners</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setGuideOpen(g => !g)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            {guideOpen ? 'Hide' : '📍 Position Guide'}
          </button>
          <button type="button" onClick={openNew}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors">
            + New Banner
          </button>
        </div>
      </div>

      {/* ── Position guide ─────────────────────────────────────── */}
      {guideOpen && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6">
          <p className="text-sm font-extrabold text-orange-700 mb-3">📍 Where does each position appear on the homepage?</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POSITIONS.map(pos => (
              <div key={pos.value} className="bg-white rounded-xl p-3.5 border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{pos.icon}</span>
                  <p className="text-xs font-extrabold text-gray-800">{pos.label}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{pos.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-orange-600 mt-3 font-medium">
            💡 Tip: Upload a high-quality image (min 1200×400 px for full-width, 800×360 px for hero) for best results. If no image is uploaded, the background colour is used instead.
          </p>
        </div>
      )}

      {/* ── Create / Edit form ─────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="font-extrabold text-gray-800 mb-5 text-base">
            {editing ? '✏️ Edit Banner' : '+ Create New Banner'}
          </h2>

          <form onSubmit={handleSubmit(d => save.mutate(d))}>
            <div className="grid md:grid-cols-2 gap-4 mb-5">

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Title *</label>
                <input {...register('title', { required: true })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Subtitle / Badge text</label>
                <input {...register('subtitle')} placeholder="e.g. Up to 60% off · Limited time"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Call-to-action Text</label>
                <input {...register('ctaText')} placeholder="Shop Now"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">CTA Link</label>
                <input {...register('ctaLink')} placeholder="/search?flashSale=true"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Position *</label>
                <select {...register('position', { required: true })} aria-label="Banner position"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white">
                  {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Display Order</label>
                <input type="number" {...register('displayOrder', { valueAsNumber: true })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Background Colour (fallback when no image)</label>
                <div className="flex gap-2">
                  <input {...register('bgColor')} placeholder="#f68b1f or linear-gradient(…)"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
                  {bgColor && !bgColor.includes('gradient') && (
                    <div className="dynamic-bg w-10 h-10 rounded-xl border border-gray-200 shrink-0"
                      style={{ '--dynamic-bg': bgColor } as React.CSSProperties} />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Start Date (optional)</label>
                <input type="datetime-local" {...register('startDate')}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">End Date (optional)</label>
                <input type="datetime-local" {...register('endDate')}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              </div>

              {/* Image upload — full row */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                  Background / Advert Image
                  <span className="ml-1 font-normal text-gray-400">(JPG, PNG or WebP · max 5 MB)</span>
                </label>
                <div className="flex gap-3 items-start">
                  <input {...register('imageUrl')} placeholder="Paste image URL or upload →"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors" />
                  <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-sm font-semibold transition-colors shrink-0 ${uploading ? 'border-orange-300 bg-orange-50 text-orange-600' : 'border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-600'}`}>
                    {uploading ? <>⏳ Uploading…</> : <>📷 Upload Image</>}
                    <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
                  </label>
                </div>

                {/* Live preview */}
                {imageUrl && (
                  <div className="mt-3 relative h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="800px" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center px-5">
                      <div className="text-white">
                        <p className="text-sm font-extrabold">Preview</p>
                        <p className="text-xs opacity-75">This is how your image will appear on the homepage</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-orange-500" />
                Active — visible on storefront immediately
              </label>
              <div className="ml-auto flex gap-2">
                <button type="button"
                  onClick={() => { setShowForm(false); setEditing(null); reset() }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={save.isPending}
                  className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm disabled:opacity-60 transition-colors">
                  {save.isPending ? 'Saving…' : editing ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Banners list ───────────────────────────────────────── */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
          ))
        ) : !banners?.length ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="text-5xl mb-3">🖼️</div>
            <p className="font-bold text-gray-700 mb-1">No banners yet</p>
            <p className="text-sm text-gray-400 mb-5">Create your first banner to start customising the homepage</p>
            <button type="button" onClick={openNew}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors">
              + Create First Banner
            </button>
          </div>
        ) : banners.map(b => {
          const pos = POSITIONS.find(p => p.value === b.position)
          return (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center hover:shadow-sm transition-shadow">

              {/* Thumbnail */}
              <div className="relative w-28 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                {b.imageUrl ? (
                  <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="112px" />
                ) : (
                  <div className="dynamic-bg w-full h-full flex items-center justify-center text-white text-xs font-bold text-center px-2"
                    style={{ '--dynamic-bg': b.bgColor || '#f68b1f' } as React.CSSProperties}>
                    {b.title}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{b.title}</p>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-xs bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                    {pos?.icon} {pos?.label}
                  </span>
                  <span className="text-xs text-gray-400">Order: {b.displayOrder}</span>
                  {b.ctaLink && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px]">→ {b.ctaLink}</span>
                  )}
                </div>
                {b.subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{b.subtitle}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.isActive ? '● Live' : '○ Draft'}
                </span>
                <button type="button" onClick={() => openEdit(b)}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                  Edit
                </button>
                <button type="button"
                  onClick={() => { if (window.confirm(`Delete "${b.title}"?`)) deleteBanner.mutate(b.id) }}
                  className="text-xs px-3 py-1.5 rounded-lg font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
