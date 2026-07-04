import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { ok, apiError, handleError } from '@/lib/api'
import { generateToken } from '@/lib/utils'
import { sendPasswordReset } from '@/lib/email'

// POST /api/admin/sub-admins/[id]/reset-password — Super Admin triggers a reset link
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(req, ['super_admin'])
    const target = await prisma.user.findUnique({ where: { id: params.id } })
    if (!target || target.role !== 'admin') return apiError('Sub-admin not found', 404)

    const resetToken = generateToken()
    await prisma.user.update({
      where: { id: params.id },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
    })
    await sendPasswordReset(target.email, target.firstName, resetToken).catch(() => {})

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'sub_admin_reset_password', entityType: 'user', entityId: params.id },
    })

    return ok({ message: 'Password reset link sent.' })
  } catch (err) { return handleError(err) }
}
