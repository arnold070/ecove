import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, apiError, handleError } from '@/lib/api'

const patchSchema = z.object({
  permissions: z.array(z.string()).optional(),
  isActive:    z.boolean().optional(),
})

// GET /api/admin/sub-admins/[id] — detail + recent activity
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req, ['super_admin'])
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, permissions: true, isActive: true, lastLoginAt: true, createdAt: true },
    })
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return apiError('Sub-admin not found', 404)

    const activity = await prisma.auditLog.findMany({
      where: { actorId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return ok({ ...user, activity })
  } catch (err) { return handleError(err) }
}

// PATCH /api/admin/sub-admins/[id] — edit permissions / deactivate
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, ['super_admin'])
    const body = patchSchema.parse(await req.json())

    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target || target.role !== 'admin') return apiError('Sub-admin not found', 404)

    const updated = await prisma.user.update({ where: { id: params.id }, data: body })

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'sub_admin_update', entityType: 'user', entityId: params.id, meta: body },
    })

    return ok({ id: updated.id, permissions: updated.permissions, isActive: updated.isActive })
  } catch (err) { return handleError(err) }
}

