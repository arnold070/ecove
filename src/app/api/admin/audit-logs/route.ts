import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { paginated, handleError, getPagination } from '@/lib/api'

// GET /api/admin/audit-logs
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, 'audit_logs.view')
    const sp = req.nextUrl.searchParams
    const { page, limit, skip } = getPagination(sp)
    const entityType = sp.get('entityType')
    const actorId = sp.get('actorId')

    const where: any = {}
    if (entityType) where.entityType = entityType
    if (actorId) where.actorId = actorId

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ])

    return paginated(logs, page, limit, total)
  } catch (err) { return handleError(err) }
}
