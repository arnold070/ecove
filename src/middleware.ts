import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
// Webhook routes use signature-based verification and must not be CSRF-blocked
const WEBHOOK_PATTERN = /^\/api\/webhooks\//
// Always-allowed production origins (env var may not include www variant)
const PRODUCTION_ORIGINS = ['https://ecove.com.ng', 'https://www.ecove.com.ng']

function csrfCheck(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/api/') || !MUTATION_METHODS.has(req.method) || WEBHOOK_PATTERN.test(pathname)) {
    return null
  }
  const origin = req.headers.get('origin')
  if (!origin) return null // no Origin header = same-origin SSR/server action
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const envOrigins = appUrl.split(',').map(s => s.trim().replace(/\/$/, ''))
  const allowed = [...new Set([...envOrigins, ...PRODUCTION_ORIGINS])]
  if (!allowed.includes(origin.replace(/\/$/, ''))) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }
  return null
}

// Routes that require authentication
const PROTECTED: { pattern: RegExp; roles: string[]; redirect: string }[] = [
  {
    pattern: /^\/admin(\/.*)?$/,
    roles:   ['admin', 'super_admin'],
    redirect: '/login?next=/admin&reason=admin_only',
  },
  {
    pattern: /^\/vendor\/dashboard(\/.*)?$/,
    roles:   ['vendor'],
    redirect: '/vendor/login?reason=vendor_only',
  },
]

// API routes that should return 401 (not redirect)
const PROTECTED_API = [
  /^\/api\/admin\//,
  /^\/api\/vendor\//,
  /^\/api\/auth\/me$/,
  /^\/api\/checkout$/,
  /^\/api\/upload$/,
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── CSRF protection — reject cross-origin mutations ──────
  const csrfError = csrfCheck(req)
  if (csrfError) return csrfError

  // ── API protection — return JSON 401 ────────────────────
  if (PROTECTED_API.some(p => p.test(pathname))) {
    // Token is validated inside each route handler via requireAuth()
    // Middleware just adds CORS headers and logs
    const res = NextResponse.next()
    res.headers.set('X-Content-Type-Options', 'nosniff')
    res.headers.set('X-Frame-Options', 'DENY')
    return res
  }

  // ── Page protection — redirect unauthenticated users ───
  for (const rule of PROTECTED) {
    if (!rule.pattern.test(pathname)) continue

    const token =
      req.cookies.get('ecove_token')?.value ||
      req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = rule.redirect.split('?')[0]
      url.search   = rule.redirect.includes('?') ? '?' + rule.redirect.split('?')[1] : ''
      return NextResponse.redirect(url)
    }

    try {
      const payload = await verifyJWT(token)
      if (!rule.roles.includes(payload.role)) {
        const url      = req.nextUrl.clone()
        url.pathname   = '/unauthorized'
        return NextResponse.redirect(url)
      }
    } catch {
      const url      = req.nextUrl.clone()
      url.pathname   = rule.redirect.split('?')[0]
      url.search     = '?reason=session_expired'
      return NextResponse.redirect(url)
    }

    break
  }

  // ── Security headers on all responses ───────────────────
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public files (images etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)',
  ],
}
