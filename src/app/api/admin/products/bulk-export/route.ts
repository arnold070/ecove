import { NextRequest } from 'next/server'
import Papa from 'papaparse'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { handleError } from '@/lib/api'

// GET /api/admin/products/bulk-export — CSV export of all products
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'products.bulk')

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { vendor: { select: { businessName: true } }, category: { select: { name: true } } },
    })

    const rows = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku || '',
      price: p.price.toString(),
      stock: p.stock,
      store: p.vendor.businessName,
      vendorId: p.vendorId,
      category: p.category?.name || '',
      categoryId: p.categoryId || '',
      status: p.status,
      isFeatured: p.isFeatured,
      tags: p.tags.join('|'),
    }))

    const csv = Papa.unparse(rows)
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ecove-products-${Date.now()}.csv"`,
      },
    })
  } catch (err) { return handleError(err) }
}
