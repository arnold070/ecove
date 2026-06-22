/**
 * Admin panel tests — authentication guard, API authorization,
 * CRUD operations, permission enforcement.
 */
import { test, expect } from '@playwright/test'

test.describe('Admin Auth Guards', () => {
  test('redirects /admin to login for unauthenticated users', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  const ADMIN_ROUTES = [
    '/admin/vendors',
    '/admin/products',
    '/admin/orders',
    '/admin/payouts',
    '/admin/commissions',
    '/admin/categories',
    '/admin/banners',
    '/admin/coupons',
    '/admin/reviews',
    '/admin/customers',
    '/admin/analytics',
    '/admin/settings',
  ]

  for (const route of ADMIN_ROUTES) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL(/\/login/)
    })
  }
})

test.describe('Admin API Authorization', () => {
  const ADMIN_API_ROUTES = [
    '/api/admin/vendors',
    '/api/admin/products',
    '/api/admin/orders',
    '/api/admin/payouts',
    '/api/admin/commissions',
    '/api/admin/categories',
    '/api/admin/banners',
    '/api/admin/coupons',
    '/api/admin/reviews',
    '/api/admin/customers',
    '/api/admin/analytics',
    '/api/admin/settings',
    '/api/admin/fraud',
  ]

  for (const route of ADMIN_API_ROUTES) {
    test(`GET ${route} returns 401 without auth`, async ({ request }) => {
      const res = await request.get(route)
      expect(res.status()).toBe(401)
    })
  }

  test('POST /api/admin/categories returns 401 without auth', async ({ request }) => {
    const res = await request.post('/api/admin/categories', {
      data: { name: 'Test Category', slug: 'test-category' }
    })
    expect(res.status()).toBe(401)
  })

  test('PUT /api/admin/vendors/:id returns 401 without auth', async ({ request }) => {
    const res = await request.put('/api/admin/vendors/fake-id', {
      data: { status: 'approved' }
    })
    expect(res.status()).toBe(401)
  })

  test('DELETE /api/admin/products/:id returns 401 without auth', async ({ request }) => {
    const res = await request.delete('/api/admin/products/fake-id')
    expect(res.status()).toBe(401)
  })

  test('PATCH /api/admin/payouts/:id returns 401 without auth', async ({ request }) => {
    const res = await request.patch('/api/admin/payouts/fake-id', {
      data: { status: 'approved' }
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('Admin API Schema Validation', () => {
  test('POST /api/admin/categories with fake token gets 403/401', async ({ request }) => {
    const res = await request.post('/api/admin/categories', {
      data: { name: '', slug: '' },
      headers: { 'Authorization': 'Bearer fake-token-not-valid' }
    })
    expect([401, 403, 422]).toContain(res.status())
  })

  test('POST /api/admin/coupons with fake token gets 401/403', async ({ request }) => {
    const res = await request.post('/api/admin/coupons', {
      data: { code: 'TEST10', type: 'percentage', value: 10 },
      headers: { 'Authorization': 'Bearer invalid-token' }
    })
    expect([401, 403]).toContain(res.status())
  })
})
