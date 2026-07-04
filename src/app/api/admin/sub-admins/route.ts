import { NextRequest } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { created, ok, apiError, handleError } from '@/lib/api'
import { generateToken } from '@/lib/utils'
import { sendPasswordReset } from '@/lib/email'
import { ROLE_TEMPLATES, ROLE_TEMPLATE_NAMES } from '@/lib/permissions'

const createSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName:  z.string().min(2).max(50),
  email:     z.string().email(),
  roleTemplate: z.enum(ROLE_TEMPLATE_NAMES as [string, ...string[]]).optional(),
  permissions:  z.array(z.string()).optional(),
})

// GET /api/admin/sub-admins — list admin-role users (also used as the "assign manager" picker)
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ['admin', 'super_admin'])
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'super_admin'] } },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, permissions: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return ok(admins)
  } catch (err) { return handleError(err) }
}

// POST /api/admin/sub-admins — Super Admin invites a sub-admin
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ['super_admin'])
    const body = createSchema.parse(await req.json())

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) return apiError('An account with this email already exists.', 409)

    const permissions = body.permissions || (body.roleTemplate ? ROLE_TEMPLATES[body.roleTemplate] : [])
    const tempPassword = generateToken(16)
    const passwordHash = await bcrypt.hash(tempPassword, 12)
    const resetToken = generateToken()
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const subAdmin = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        passwordHash,
        role: 'admin',
        isEmailVerified: true,
        permissions,
        invitedById: auth.sub,
        resetToken,
        resetTokenExpiry: resetExpiry,
      },
    })

    await sendPasswordReset(body.email, body.firstName, resetToken).catch(() => {})

    await prisma.auditLog.create({
      data: { actorId: auth.sub, actorRole: auth.role, action: 'sub_admin_invite', entityType: 'user', entityId: subAdmin.id, meta: { email: body.email, permissions } },
    })

    return created({ id: subAdmin.id, email: subAdmin.email, permissions })
  } catch (err) { return handleError(err) }
}
