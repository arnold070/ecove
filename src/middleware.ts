import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
// Webhook routes use signature-based verification and must not be CSRF-blocked
const WEBHOOK_PATTERN = /^\/api\/webhooks\//
// Always-allowed production origins (env var may not include www variant)
const PRODUCTION_ORIGINS = ['https://ecove.com.ng', 'https://www.ecove.com.ng']

// ── Maintenance mode ──────────────────────────────────────
// Set MAINTENANCE_MODE=true to take the site offline. Payment webhooks
// stay reachable so in-flight Paystack/Flutterwave callbacks aren't lost.
const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ecove — Down for Maintenance</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#0f172a; color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; text-align:center; padding:24px; }
  .card { max-width:480px; }
  h1 { font-size:1.5rem; margin-bottom:0.5rem; }
  p { color:#94a3b8; line-height:1.6; }
</style>
</head>
<body>
  <div class="card">
    <h1>We'll be right back</h1>
    <p>Ecove is undergoing scheduled maintenance. Please check back shortly.</p>
  </div>
</body>
</html>`

function maintenanceCheck(req: NextRequest): NextResponse | null {
  if (process.env.MAINTENANCE_MODE !== 'true') return null
  const { pathname } = req.nextUrl
  if (WEBHOOK_PATTERN.test(pathname)) return null

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Service temporarily unavailable for maintenance' }, { status: 503 })
  }
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' },
  })
}

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
]

// API routes that should return 401 (not redirect)
const PROTECTED_API = [
  /^\/api\/admin\//,
  /^\/api\/auth\/me$/,
  /^\/api\/checkout$/,
  /^\/api\/upload$/,
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Maintenance mode — short-circuit everything else ─────
  const maintenanceRes = maintenanceCheck(req)
  if (maintenanceRes) return maintenanceRes

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
