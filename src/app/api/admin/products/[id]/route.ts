import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { ok, apiError, handleError } from '@/lib/api'
import { sendProductApproved, sendProductRejected } from '@/lib/email'

const actionSchema = z.object({
  action:    z.enum(['approve', 'reject', 'suspend']),
  adminNote: z.string().max(500).optional(),
})

const editSchema = z.object({
  name:             z.string().min(2).max(255).optional(),
  description:      z.string().optional(),
  shortDescription: z.string().max(160).optional(),
  price:            z.number().positive().optional(),
  comparePrice:     z.number().positive().optional(),
  costPrice:        z.number().positive().optional(),
  sku:              z.string().max(100).optional(),
  stock:            z.number().int().min(0).optional(),
  lowStockAlert:    z.number().int().min(0).optional(),
  weight:           z.number().positive().optional(),
  categoryId:       z.string().optional(),
  brand:            z.string().max(100).optional(),
  handlingTime:     z.string().max(50).optional(),
  shipsFrom:        z.string().max(100).optional(),
  isFeatured:       z.boolean().optional(),
  isBestSeller:     z.boolean().optional(),
  isFlashSale:      z.boolean().optional(),
  flashSalePrice:   z.number().positive().optional(),
  flashSaleEnd:     z.string().datetime().optional(),
  tags:             z.array(z.string()).optional(),
  metaTitle:        z.string().max(70).optional(),
  metaDescription:  z.string().max(160).optional(),
  specifications:   z.record(z.string()).optional(),
})

// GET /api/admin/products/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission(req, 'products.view')
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        vendor:   { select: { id: true, businessName: true, user: { select: { email: true } } } },
        category: true,
        images:   true,
        variants: true,
        _count:   { select: { orderItems: true, reviews: true } },
      },
    })
    if (!product) return apiError('Product not found', 404)
    return ok(product)
  } catch (err) { return handleError(err) }
}

// PATCH /api/admin/products/[id]  — approve | reject | suspend
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requirePermission(req, 'products.manage')
    const body = actionSchema.parse(await req.json())

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { vendor: { include: { user: { select: { email: true } } } } },
    })
    if (!product) return apiError('Product not found', 404)

    const statusMap = { approve: 'approved', reject: 'rejected', suspend: 'suspended' }
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        status:       statusMap[body.action] as any,
        adminNote:    body.adminNote,
        isActive:     body.action === 'approve',
        reviewedAt:   new Date(),
        reviewedById: auth.sub,
      },
    })

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: `product_${body.action}`, entityType: 'product', entityId: params.id, meta: { note: body.adminNote } },
    })

    const vendorEmail = product.vendor.user?.email
    if (vendorEmail && body.action === 'approve') await sendProductApproved(vendorEmail, product.name).catch(() => {})
    if (vendorEmail && body.action === 'reject')  await sendProductRejected(vendorEmail, product.name, body.adminNote || 'Does not meet listing standards').catch(() => {})

    return ok(updated)
  } catch (err) { return handleError(err) }
}

// PUT /api/admin/products/[id]  — admin edits any product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requirePermission(req, 'products.manage')
    const body = editSchema.parse(await req.json())
    const data: any = { ...body }
    if (body.flashSaleEnd) data.flashSaleEnd = new Date(body.flashSaleEnd)
    const updated = await prisma.product.update({ where: { id: params.id }, data })
    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'product_edit', entityType: 'product', entityId: params.id, meta: body },
    })
    return ok(updated)
  } catch (err) { return handleError(err) }
}

// DELETE /api/admin/products/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requirePermission(req, 'products.manage')
    await prisma.product.delete({ where: { id: params.id } })
    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'product_delete', entityType: 'product', entityId: params.id },
    })
    return ok({ message: 'Product deleted.' })
  } catch (err) { return handleError(err) }
}
