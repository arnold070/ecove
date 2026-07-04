import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { requirePermission } from '@/lib/auth'
import { ok, apiError, handleError } from '@/lib/api'

const patchSchema = z.object({
  status:    z.enum(['new', 'reviewing', 'contacted', 'converted', 'rejected']),
  adminNote: z.string().max(1000).optional(),
})

// GET /api/admin/partnerships/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission(req, 'partnerships.view')
    const inquiry = await prisma.partnerInquiry.findUnique({ where: { id: params.id } })
    if (!inquiry) return apiError('Partnership inquiry not found', 404)
    return ok(inquiry)
  } catch (err) { return handleError(err) }
}

// PATCH /api/admin/partnerships/[id] — update review status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requirePermission(req, 'partnerships.manage')
    const body = patchSchema.parse(await req.json())

    const updated = await prisma.partnerInquiry.update({
      where: { id: params.id },
      data: {
        status: body.status,
        adminNote: body.adminNote,
        reviewedAt: new Date(),
        reviewedById: auth.sub,
      },
    })

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'partnership_status_update', entityType: 'partner_inquiry', entityId: params.id, meta: { status: body.status } },
    })

    return ok(updated)
  } catch (err) { return handleError(err) }
}
