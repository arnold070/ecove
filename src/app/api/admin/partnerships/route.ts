import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { paginated, handleError, getPagination } from '@/lib/api'

// GET /api/admin/partnerships
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'partnerships.view')
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = getPagination(sp)
    const status = sp.get('status') as any

    const where: any = {}
    if (status) where.status = status

    const [inquiries, total] = await Promise.all([
      prisma.partnerInquiry.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.partnerInquiry.count({ where }),
    ])

    return paginated(inquiries, page, limit, total)
  } catch (err) { return handleError(err) }
}
