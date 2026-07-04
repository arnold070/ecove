import { NextRequest } from 'next/server'
import { z } from 'zod'
import Papa from 'papaparse'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { ok, apiError, handleError } from '@/lib/api'
import { uniqueSlug } from '@/lib/utils'

const rowSchema = z.object({
  name:       z.string().min(2).max(255),
  vendorId:   z.string().uuid(),
  price:      z.coerce.number().positive(),
  stock:      z.coerce.number().int().min(0),
  sku:        z.string().optional(),
  categoryId: z.string().optional(),
  tags:       z.string().optional(),
})

// POST /api/admin/products/bulk-import — CSV upload, per-row validation, batch create
export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission(req, 'products.bulk')

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return apiError('No CSV file provided.', 400)

    const text = await file.text()
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
    if (parsed.errors.length) return apiError('Could not parse CSV file.', 400, parsed.errors)

    const results: { created: number; errors: { row: number; message: string }[] } = { created: 0, errors: [] }
    const toCreate: any[] = []

    for (let i = 0; i < parsed.data.length; i++) {
      const raw = parsed.data[i] as any
      const parsedRow = rowSchema.safeParse(raw)
      if (!parsedRow.success) {
        results.errors.push({ row: i + 2, message: parsedRow.error.issues.map(e => e.message).join('; ') })
        continue
      }
      const row = parsedRow.data
      const slug = await uniqueSlug(row.name, 'product')
      toCreate.push({
        name: row.name,
        slug,
        vendorId: row.vendorId,
        price: row.price,
        stock: row.stock,
        sku: row.sku || undefined,
        categoryId: row.categoryId || undefined,
        tags: row.tags ? row.tags.split('|').map((t: string) => t.trim()).filter(Boolean) : [],
        status: 'approved',
        isActive: true,
        reviewedAt: new Date(),
        reviewedById: auth.sub,
      })
    }

    if (toCreate.length) {
      await prisma.$transaction(toCreate.map(data => prisma.product.create({ data })))
      results.created = toCreate.length
    }

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'product_bulk_import', entityType: 'product', entityId: 'bulk', meta: results },
    })

    return ok(results)
  } catch (err) { return handleError(err) }
}
