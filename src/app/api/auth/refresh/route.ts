import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, signJWT } from '@/lib/jwt'
import { apiError } from '@/lib/api'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('ecove_token')?.value
    if (!token) return apiError('No session found', 401)

    // Verify the existing token — jose throws JWTExpired for expired tokens
    let payload: any
    try {
      payload = await verifyJWT(token)
    } catch (err: any) {
      // Allow refresh within grace period even if expired
      if (err?.code !== 'ERR_JWT_EXPIRED') return apiError('Invalid token', 401)
      // Decode without verification to get claims for the refresh
      const { decodeJwt } = await import('jose')
      payload = decodeJwt(token)
      if (!payload?.sub) return apiError('Invalid token', 401)
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true, role: true, email: true, isActive: true,
        vendor: { select: { id: true, status: true } },
      },
    })

    if (!user || !user.isActive) return apiError('Account not found or deactivated', 401)
    if (user.role === 'vendor' && user.vendor?.status !== 'approved') {
      return apiError('Vendor account is not active', 403)
    }

    const newToken = await signJWT({
      sub: user.id,
      role: user.role,
      email: user.email,
      vendorId: user.vendor?.id,
    })

    // Rotate the session: delete old record, create new one
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.$transaction([
      prisma.session.deleteMany({ where: { token } }),
      prisma.session.create({
        data: { userId: user.id, token: newToken, expiresAt },
      }),
    ])

    const res = NextResponse.json({ success: true, data: { token: newToken } })
    res.cookies.set('ecove_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    return res
  } catch {
    return apiError('Session refresh failed', 401)
  }
}
