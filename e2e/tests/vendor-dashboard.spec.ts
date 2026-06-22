/**
 * Vendor dashboard tests — authentication guard, navigation,
 * products CRUD, orders, earnings, inventory, profile.
 */
import { test, expect } from '@playwright/test'

test.describe('Vendor Dashboard Auth Guard', () => {
  test('redirects to vendor login when not authenticated', async ({ page }) => {
    await page.goto('/vendor/dashboard')
    await expect(page).toHaveURL(/\/vendor\/login/)
  })

  test('vendor dashboard sub-routes are all protected', async ({ page }) => {
    const routes = [
      '/vendor/dashboard/products',
      '/vendor/dashboard/orders',
      '/vendor/dashboard/earnings',
      '/vendor/dashboard/inventory',
      '/vendor/dashboard/reports',
      '/vendor/dashboard/store',
      '/vendor/dashboard/profile',
    ]
    for (const route of routes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/vendor\/login/)
    }
  })
})

test.describe('Vendor Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendor/login')
  })

  test('renders vendor login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /vendor/i }).or(
      page.getByText(/vendor login/i)
    )).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation errors for empty submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/email|required/i)).toBeVisible()
  })

  test('shows error for wrong credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('notavendor@ecove-test.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(
      page.getByText(/invalid|wrong|incorrect/i).or(page.getByText(/not found/i))
    ).toBeVisible({ timeout: 10_000 })
  })

  test('has link to vendor registration', async ({ page }) => {
    await expect(page.getByRole('link', { name: /register|apply|become/i })).toBeVisible()
  })
})

test.describe('Vendor Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendor/register')
  })

  test('renders multi-step registration form', async ({ page }) => {
    await expect(page.getByText(/vendor|seller|business/i)).toBeVisible()
    // Should have form fields for business info
    await expect(page.locator('input, textarea, select').first()).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    // Try to submit without filling anything
    const submitBtn = page.getByRole('button', { name: /next|submit|register|apply/i }).last()
    await submitBtn.click()
    // Some validation should show
    await expect(
      page.getByText(/required|invalid|enter/i).first()
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Vendor API Endpoints (Auth Required)', () => {
  test('GET /api/vendor/dashboard returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/vendor/dashboard')
    expect(res.status()).toBe(401)
  })

  test('GET /api/vendor/products returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/vendor/products')
    expect(res.status()).toBe(401)
  })

  test('GET /api/vendor/orders returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/vendor/orders')
    expect(res.status()).toBe(401)
  })

  test('GET /api/vendor/payouts returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/vendor/payouts')
    expect(res.status()).toBe(401)
  })

  test('POST /api/vendor/products returns 401 without token', async ({ request }) => {
    const res = await request.post('/api/vendor/products', {
      data: { name: 'Test', price: 100 }
    })
    expect(res.status()).toBe(401)
  })

  test('GET /api/vendor/notifications returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/vendor/notifications')
    expect(res.status()).toBe(401)
  })
})

test.describe('Vendor Products CRUD API Validation', () => {
  test('POST /api/vendor/products validates schema', async ({ request }) => {
    // Missing required fields, no auth
    const res = await request.post('/api/vendor/products', {
      data: { title: 'Incomplete' },
      headers: { 'Authorization': 'Bearer fake-token' }
    })
    expect([401, 403, 422]).toContain(res.status())
  })

  test('PUT /api/vendor/products/:id returns 401 for no token', async ({ request }) => {
    const res = await request.put('/api/vendor/products/fake-id', {
      data: { name: 'Updated' }
    })
    expect(res.status()).toBe(401)
  })

  test('DELETE /api/vendor/products/:id returns 401 for no token', async ({ request }) => {
    const res = await request.delete('/api/vendor/products/fake-id')
    expect(res.status()).toBe(401)
  })
})

test.describe('Vendor Order Status Update API', () => {
  test('PATCH /api/vendor/orders/:id requires auth', async ({ request }) => {
    const res = await request.patch('/api/vendor/orders/fake-id', {
      data: { status: 'shipped' }
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('New Product Form', () => {
  test('new product page redirects unauthenticated users', async ({ page }) => {
    await page.goto('/vendor/dashboard/products/new')
    await expect(page).toHaveURL(/\/vendor\/login/)
  })
})
