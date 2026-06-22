/**
 * Edge-runtime-safe JWT helpers.
 * No Prisma or Node.js-only imports — safe to use in middleware.
 */
import { SignJWT, jwtVerify } from 'jose'

export interface JWTPayload {
  sub: string
  role: string
  vendorId?: string
  email: string
  iat?: number
  exp?: number
}

function secret() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET env var is not set')
  return new TextEncoder().encode(s)
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const expires = process.env.JWT_EXPIRES_IN || '7d'
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secret())
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret())
  return payload as unknown as JWTPayload
}
