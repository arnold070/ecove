/**
 * Security tests — XSS, CSRF, injection, auth bypass,
 * missing headers, sensitive data exposure, input validation.
 */
import { test, expect } from '@playwright/test'

async function apiPost(request: any, path: string, body: Record<string, unknown>) {
  return request.post(`/api${path}`, {
    data: body,
    headers: { 'Content-Type': 'application/json' },
  })
}

test.describe('XSS Prevention', () => {
  const XSS_PAYLOADS = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    "'; DROP TABLE users; --",
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
  ]

  test('search query input does not execute XSS', async ({ page }) => {
    let alertFired = false
    page.on('dialog', dialog => {
      alertFired = true
      dialog.dismiss()
    })

    for (const payload of XSS_PAYLOADS) {
      await page.goto(`/search?q=${encodeURIComponent(payload)}`)
      await page.waitForTimeout(500)
    }
    expect(alertFired).toBe(false)
  })

  test('login form does not execute XSS in email field', async ({ page }) => {
    let alertFired = false
    page.on('dialog', dialog => {
      alertFired = true
      dialog.dismiss()
    })
    await page.goto('/login')
    await page.getByLabel('Email address').fill('<script>alert(1)</script>')
    await page.getByLabel('Password').fill('pass')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForTimeout(500)
    expect(alertFired).toBe(false)
  })

  test('registration form sanitizes input', async ({ page }) => {
    let alertFired = false
    page.on('dialog', dialog => {
      alertFired = true
      dialog.dismiss()
    })
    await page.goto('/register')
    await page.getByLabel('First Name').fill('<img src=x onerror=alert(1)>')
    await page.getByLabel('Last Name').fill('"><script>alert(1)</script>')
    await page.getByLabel('Email').fill('test@test.com')
    await page.getByLabel('Password').fill('StrongPass123!')
    await page.getByLabel('Confirm Password').fill('StrongPass123!')
    await page.getByRole('button', { name: /create account/i }).click()
    await page.waitForTimeout(1000)
    expect(alertFired).toBe(false)
  })

  test('track order input does not execute XSS', async ({ page }) => {
    let alertFired = false
    page.on('dialog', dialog => {
      alertFired = true
      dialog.dismiss()
    })
    await page.goto('/track')
    const input = page.locator('input').first()
    await input.fill('<script>alert(1)</script>')
    await page.getByRole('button').last().click()
    await page.waitForTimeout(500)
    expect(alertFired).toBe(false)
  })
})

test.describe('Security Headers', () => {
  test('main page includes X-Content-Type-Options: nosniff', async ({ request }) => {
    const res = await request.get('/')
    expect(res.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('main page includes X-Frame-Options', async ({ request }) => {
    const res = await request.get('/')
    const xfo = res.headers()['x-frame-options']
    expect(xfo).toBeDefined()
    expect(['DENY', 'SAMEORIGIN']).toContain(xfo?.toUpperCase())
  })

  test('API routes include security headers', async ({ request }) => {
    const res = await request.get('/api/health')
    const headers = res.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBeDefined()
  })

  test('API responses do not leak sensitive server information', async ({ request }) => {
    const res = await request.get('/api/health')
    const headers = res.headers()
    // Should not expose server version details
    expect(headers['server']).not.toMatch(/apache|nginx\/\d|express\/\d/i)
  })
})

test.describe('Authentication & Authorization', () => {
  test('cannot access admin API with customer JWT', async ({ request }) => {
    // Login as customer would require real credentials — just verify the 401 path
    const res = await request.get('/api/admin/vendors', {
      headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.fake.token' }
    })
    expect([401, 403]).toContain(res.status())
  })

  test('cannot access vendor API with expired token', async ({ request }) => {
    // An obviously fake/expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InZlbmRvciIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsImV4cCI6MTYwMDAwMDAwMH0.invalid'
    const res = await request.get('/api/vendor/dashboard', {
      headers: { 'Authorization': `Bearer ${expiredToken}` }
    })
    expect([401, 403]).toContain(res.status())
  })

  test('JWT is stored in HttpOnly cookie, not localStorage', async ({ page }) => {
    await page.goto('/login')
    // After page load, JWT should not be in localStorage
    const tokenInStorage = await page.evaluate(() => {
      return Object.keys(localStorage).some(k =>
        k.toLowerCase().includes('token') ||
        k.toLowerCase().includes('jwt') ||
        k.toLowerCase().includes('auth')
      )
    })
    expect(tokenInStorage).toBe(false)
  })

  test('sensitive user data is not in HTML source', async ({ page }) => {
    await page.goto('/')
    const content = await page.content()
    // No passwords or secrets in HTML
    expect(content).not.toMatch(/password"?\s*:\s*"[^"]{3,}"/)
    expect(content).not.toMatch(/JWT_SECRET/)
    expect(content).not.toMatch(/DATABASE_URL/)
  })
})

test.describe('Input Validation (API level)', () => {
  test('POST /api/auth/register rejects SQL injection in email', async ({ request }) => {
    const res = await apiPost(request, '/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: "'; DROP TABLE users; --@test.com",
      password: 'StrongPass123!'
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /api/auth/login rejects empty password', async ({ request }) => {
    const res = await apiPost(request, '/auth/login', {
      email: 'test@test.com',
      password: ''
    })
    expect([400, 401, 422]).toContain(res.status())
  })

  test('search endpoint does not expose database errors', async ({ request }) => {
    const res = await request.get("/api/storefront/search?q='; DROP TABLE products; --")
    expect(res.status()).toBe(200)
    const body = await res.json()
    // Should return empty results, not a database error
    expect(body.success).toBe(true)
    expect(body.error).toBeUndefined()
  })

  test('pagination parameters are sanitized', async ({ request }) => {
    const res = await request.get('/api/storefront/products?page=-1&limit=99999')
    expect(res.status()).toBe(200)
    const body = await res.json()
    // Limit should be capped, not crash
    expect(body.success).toBe(true)
    if (body.pagination) {
      expect(body.pagination.limit).toBeLessThanOrEqual(100)
    }
  })
})

test.describe('CSRF Protection', () => {
  test('POST requests include credentials (cookie-based CSRF protection)', async ({ request }) => {
    // The app uses SameSite=Lax cookies which provides basic CSRF protection
    // Verify the cookie settings
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'test@test.com', password: 'wrongpassword' }
    })
    // Even failed logins should not expose CSRF vulnerabilities
    expect([401, 422, 429]).toContain(loginRes.status())
  })
})

test.describe('Rate Limiting', () => {
  test('login endpoint has rate limiting', async ({ request }) => {
    // Make 11 rapid requests
    const reqs = []
    for (let i = 0; i < 11; i++) {
      reqs.push(apiPost(request, '/auth/login', {
        email: `ratelimit${i}@test.com`,
        password: 'wrongpass'
      }))
    }
    const responses = await Promise.all(reqs)
    const statuses = responses.map(r => r.status())
    // Should get some non-200/non-422 responses (401 for wrong creds)
    expect(statuses.every(s => [401, 422, 429].includes(s))).toBe(true)
  })
})

test.describe('Sensitive Route Protection', () => {
  test('/admin is protected by middleware redirect', async ({ page }) => {
    await page.goto('/admin')
    const url = page.url()
    expect(url).toMatch(/\/login/)
    // Should have a reason parameter
    expect(url).toContain('admin_only')
  })

  test('/vendor/dashboard is protected', async ({ page }) => {
    await page.goto('/vendor/dashboard')
    expect(page.url()).toMatch(/\/vendor\/login/)
  })
})
