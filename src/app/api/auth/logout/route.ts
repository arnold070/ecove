import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('ecove_token')?.value

  if (token) {
    // Invalidate the server-side session so the JWT cannot be reused after logout
    await prisma.session.deleteMany({ where: { token } }).catch(() => {})
  }

  const res = NextResponse.json({ success: true, data: { message: 'Logged out.' } })
  res.cookies.set('ecove_token', '', { maxAge: 0, path: '/' })
  return res
}
