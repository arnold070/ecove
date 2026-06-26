import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { ok, apiError, handleError } from '@/lib/api'
import { generateToken } from '@/lib/utils'
import { sendVerifyEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!await rateLimit(`resend-verify-public:${ip}`, 3, 10 * 60 * 1000)) {
      return apiError('Too many requests. Please wait 10 minutes.', 429)
    }

    const { email } = schema.parse(await req.json())

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, isEmailVerified: true },
    })

    // Always respond with success to avoid revealing if email is registered
    if (!user || user.isEmailVerified) {
      return ok({ message: 'If this email is registered and unverified, a new link has been sent.' })
    }

    const token  = generateToken()
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: token, emailVerifyExpiry: expiry },
    })
    await sendVerifyEmail(user.email, user.firstName, token)

    return ok({ message: 'Verification email sent. Please check your inbox.' })
  } catch (err) {
    return handleError(err)
  }
}
