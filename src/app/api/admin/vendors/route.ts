import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { created, paginated, handleError, getPagination } from '@/lib/api'
import { uniqueSlug } from '@/lib/utils'

const createSchema = z.object({
  businessName:   z.string().min(2).max(120),
  description:    z.string().max(1000).optional(),
  tagline:        z.string().max(200).optional(),
  phone:          z.string().min(7).max(20),
  whatsapp:       z.string().optional(),
  city:           z.string().min(2).max(100),
  state:          z.string().min(2).max(100),
  address:        z.string().min(5).max(255),
  logoUrl:        z.string().url().optional(),
  bannerUrl:      z.string().url().optional(),
  managedById:    z.string().uuid().optional(),
  isVisible:      z.boolean().optional(),
  isFeatured:     z.boolean().optional(),
  categoryTags:   z.array(z.string()).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
})

// GET /api/admin/vendors
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'stores.view')
    const sp     = req.nextUrl.searchParams
    const { page, limit, skip } = getPagination(sp)
    const status = sp.get('status') as any
    const search = sp.get('q') || ''

    const where: any = {}
    if (status) where.status = status
    if (search) where.OR = [
      { businessName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          _count: { select: { products: true, orderItems: true } },
        },
      }),
      prisma.vendor.count({ where }),
    ])

    return paginated(vendors, page, limit, total)
  } catch (err) {
    return handleError(err)
  }
}

// POST /api/admin/vendors — admin creates a store directly (no vendor self-service)
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'stores.manage')
    const body = createSchema.parse(await req.json())
    const slug = await uniqueSlug(body.businessName, 'vendor')

    const vendor = await prisma.vendor.create({
      data: { ...body, slug, status: 'approved', approvedAt: new Date(), approvedById: auth.sub },
    })

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'vendor_create', entityType: 'vendor', entityId: vendor.id, meta: { businessName: body.businessName } },
    })

    return created(vendor)
  } catch (err) {
    return handleError(err)
  }
}
