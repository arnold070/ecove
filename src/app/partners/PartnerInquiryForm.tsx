'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'

interface FormData {
  businessName: string
  contactPerson: string
  email: string
  phone: string
  location: string
  businessType: string
  industry: string
  numberOfProducts?: number
  estimatedMonthlyCapacity?: string
  shortDescription: string
  website?: string
  socialLinks?: string
  message?: string
}

export default function PartnerInquiryForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, String(v)) })
      if (file) fd.append('companyProfile', file)
      await axios.post('/api/partnerships', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSubmitted(true)
      reset()
      setFile(null)
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <p className="text-4xl mb-4">🤝</p>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Thank you for your interest.</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">Our team will review your submission and contact you.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Business Name *</label>
          <input {...register('businessName', { required: true, minLength: 2 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.businessName && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Contact Person *</label>
          <input {...register('contactPerson', { required: true, minLength: 2 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.contactPerson && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Email *</label>
          <input type="email" {...register('email', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.email && <p className="text-xs text-red-500 mt-1">Valid email required</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone *</label>
          <input {...register('phone', { required: true, minLength: 7 })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Location *</label>
        <input {...register('location', { required: true })} placeholder="City, State" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        {errors.location && <p className="text-xs text-red-500 mt-1">Required</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Business Type *</label>
          <select {...register('businessType', { required: true })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
            <option value="">— Select —</option>
            <option>Brand / Manufacturer</option>
            <option>Distributor / Wholesaler</option>
            <option>Logistics Provider</option>
            <option>Payment / Fintech</option>
            <option>Affiliate / Influencer</option>
            <option>Other</option>
          </select>
          {errors.businessType && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Industry *</label>
          <input {...register('industry', { required: true })} placeholder="Electronics, Fashion, etc." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
          {errors.industry && <p className="text-xs text-red-500 mt-1">Required</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Number of Products</label>
          <input type="number" {...register('numberOfProducts')} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Estimated Monthly Capacity</label>
          <input {...register('estimatedMonthlyCapacity')} placeholder="e.g. 500 units/month" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Short Description *</label>
        <textarea {...register('shortDescription', { required: true, minLength: 10 })} rows={3} placeholder="Tell us about your business…" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        {errors.shortDescription && <p className="text-xs text-red-500 mt-1">Please provide at least a short summary</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Website <span className="text-gray-400 font-normal">(optional)</span></label>
          <input {...register('website')} placeholder="https://" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Social Media Links <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <input {...register('socialLinks')} placeholder="Instagram, Twitter…" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Company Profile <span className="text-gray-400 font-normal">(optional, image)</span></label>
        <input type="file" accept="image/*" aria-label="Upload company profile" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Message</label>
        <textarea {...register('message')} rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
      </div>

      <button type="submit" disabled={submitting}
        className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50" style={{ background: '#f68b1f' }}>
        {submitting ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  )
}
