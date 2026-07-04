import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { created, paginated, handleError, getPagination } from '@/lib/api'
import { uniqueSlug } from '@/lib/utils'

const createSchema = z.object({
  name:             z.string().min(2).max(255),
  description:      z.string().optional(),
  shortDescription: z.string().max(160).optional(),
  vendorId:         z.string().uuid(),
  price:            z.number().positive(),
  comparePrice:     z.number().positive().optional(),
  costPrice:        z.number().positive().optional(),
  sku:              z.string().max(100).optional(),
  stock:            z.number().int().min(0),
  lowStockAlert:    z.number().int().min(0).optional(),
  weight:           z.number().positive().optional(),
  categoryId:       z.string().optional(),
  brand:            z.string().max(100).optional(),
  handlingTime:     z.string().max(50).optional(),
  shipsFrom:        z.string().max(100).optional(),
  tags:             z.array(z.string()).optional(),
  metaTitle:        z.string().max(70).optional(),
  metaDescription:  z.string().max(160).optional(),
  specifications:   z.record(z.string()).optional(),
  isFeatured:       z.boolean().optional(),
  images:           z.array(z.string().url()).optional(),
  variants: z.array(z.object({
    name:  z.string(),
    value: z.string(),
    stock: z.number().int().min(0),
    sku:   z.string().optional(),
    priceAdjustment: z.number().optional(),
  })).optional(),
})

// GET /api/admin/products  — list all products with filters
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'products.view')
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = getPagination(sp)
    const status     = sp.get('status') as any
    const vendorId   = sp.get('vendorId')
    const categoryId = sp.get('categoryId')
    const search     = sp.get('q') || ''

    const where: any = {}
    if (status)     where.status = status
    if (vendorId)   where.vendorId = vendorId
    if (categoryId) where.categoryId = categoryId
    if (search)     where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ]

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor:   { select: { id: true, businessName: true, slug: true } },
          category: { select: { id: true, name: true } },
          images:   { where: { isPrimary: true }, take: 1 },
          _count:   { select: { orderItems: true, reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ])

    return paginated(products, page, limit, total)
  } catch (err) { return handleError(err) }
}

// POST /api/admin/products  — admin creates a product directly (goes live immediately)
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'products.manage')
    const body = createSchema.parse(await req.json())
    const slug = await uniqueSlug(body.name, 'product')
    const { variants, images, vendorId, ...productData } = body

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        vendorId,
        status:   'approved',
        isActive: true,
        reviewedAt: new Date(),
        reviewedById: auth.sub,
        ...(variants?.length && { variants: { create: variants } }),
        ...(images?.length && {
          images: { create: images.map((url, i) => ({ url, isPrimary: i === 0, sortOrder: i })) },
        }),
      },
      include: { variants: true, images: true },
    })

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'product_create', entityType: 'product', entityId: product.id, meta: { name: body.name, vendorId } },
    })

    return created(product)
  } catch (err) { return handleError(err) }
}
