import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { created, apiError, handleError } from '@/lib/api'
import { rateLimit } from '@/lib/rateLimit'
import { uploadImage } from '@/lib/cloudinary'

const schema = z.object({
  businessName:             z.string().min(2).max(120),
  contactPerson:            z.string().min(2).max(100),
  email:                    z.string().email(),
  phone:                    z.string().min(7).max(20),
  location:                 z.string().min(2).max(150),
  businessType:             z.string().min(2).max(100),
  industry:                 z.string().min(2).max(100),
  numberOfProducts:         z.coerce.number().int().min(0).optional(),
  estimatedMonthlyCapacity: z.string().max(100).optional(),
  shortDescription:         z.string().min(10).max(1000),
  website:                  z.string().url().optional().or(z.literal('')),
  socialLinks:              z.string().max(500).optional(), // comma-separated
  message:                  z.string().max(2000).optional(),
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

// POST /api/partnerships — public lead-gen inquiry, no account created
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!await rateLimit(`partner-inquiry:${ip}`, 3, 60 * 60 * 1000)) {
      return apiError('Too many submissions from this IP. Try again later.', 429)
    }

    const formData = await req.formData()
    const raw: Record<string, unknown> = {}
    for (const key of ['businessName', 'contactPerson', 'email', 'phone', 'location', 'businessType', 'industry', 'numberOfProducts', 'estimatedMonthlyCapacity', 'shortDescription', 'website', 'socialLinks', 'message']) {
      const val = formData.get(key)
      if (val !== null) raw[key] = val
    }
    const body = schema.parse(raw)

    let companyProfileUrl: string | undefined
    const file = formData.get('companyProfile') as File | null
    if (file && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) return apiError('Company profile must be a JPG, PNG, or WebP image.', 400)
      if (file.size > MAX_SIZE_BYTES) return apiError('Company profile file too large. Maximum size is 5MB.', 400)
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadImage(buffer, 'partner-profiles')
      companyProfileUrl = result.url
    }

    const inquiry = await prisma.partnerInquiry.create({
      data: {
        ...body,
        website: body.website || undefined,
        socialLinks: body.socialLinks ? body.socialLinks.split(',').map(s => s.trim()).filter(Boolean) : [],
        companyProfileUrl,
      },
    })

    const admins = await prisma.user.findMany({ where: { role: 'super_admin' }, select: { id: true } })
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          type: 'partnership_inquiry' as const,
          title: 'New Partnership Inquiry',
          message: `${body.businessName} submitted a partnership inquiry.`,
          link: `/admin/partnerships/${inquiry.id}`,
        })),
      })
    }

    return created({ message: 'Thank you for your interest. Our team will review your submission and contact you.' })
  } catch (err) { return handleError(err) }
}
