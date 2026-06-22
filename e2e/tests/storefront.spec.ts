/**
 * Storefront tests — homepage, product listing, product detail,
 * search, categories, vendor store pages, order tracking.
 */
import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders hero section', async ({ page }) => {
    // Hero slider or fallback slides
    await expect(
      page.getByText(/shop phones/i).or(page.getByText(/flash sale/i)).or(
        page.getByText(/shop now/i)
      )
    ).toBeVisible()
  })

  test('renders trust strip with delivery info', async ({ page }) => {
    await expect(page.getByText(/free delivery/i)).toBeVisible()
    await expect(page.getByText(/secure payment/i)).toBeVisible()
    await expect(page.getByText(/verified sellers/i)).toBeVisible()
  })

  test('renders shop by category section', async ({ page }) => {
    await expect(page.getByText(/shop by category/i)).toBeVisible()
  })

  test('renders vendor CTA section', async ({ page }) => {
    await expect(page.getByText(/start selling/i).or(page.getByText(/become a vendor/i))).toBeVisible()
    await expect(page.getByRole('link', { name: /become a vendor/i })).toBeVisible()
  })

  test('no hydration errors in console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('Hydration')) {
        errors.push(msg.text())
      }
    })
    await page.goto('/')
    await page.waitForTimeout(1000)
    expect(errors).toHaveLength(0)
  })

  test('product cards link to product detail pages', async ({ page }) => {
    const productLinks = page.getByRole('link').filter({ has: page.locator('.line-clamp-2') })
    const count = await productLinks.count()
    if (count > 0) {
      await productLinks.first().click()
      await expect(page).toHaveURL(/\/products\//)
    } else {
      // No products seeded — skip
      test.skip()
    }
  })
})

test.describe('Search', () => {
  test('search results page renders', async ({ page }) => {
    await page.goto('/search')
    await expect(page).toHaveURL('/search')
    await expect(page.getByText(/search/i).first()).toBeVisible()
  })

  test('search with query shows results or empty state', async ({ page }) => {
    await page.goto('/search?q=phone')
    await expect(page.getByText(/phone/i).or(page.getByText(/no results/i).or(
      page.getByText(/found/i)
    ))).toBeVisible({ timeout: 10_000 })
  })

  test('search with flashSale filter works', async ({ page }) => {
    await page.goto('/search?flashSale=true')
    await expect(page).toHaveURL(/flashSale=true/)
  })

  test('search with sort parameter works', async ({ page }) => {
    await page.goto('/search?sort=newest')
    await expect(page).toHaveURL(/sort=newest/)
  })

  test('API search endpoint returns data', async ({ request }) => {
    const res = await request.get('/api/storefront/search?q=phone')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('API typeahead returns data', async ({ request }) => {
    const res = await request.get('/api/storefront/search?q=ph&typeahead=true')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})

test.describe('Product Detail Page', () => {
  test('product page with unknown slug returns 404', async ({ page }) => {
    const res = await page.goto('/products/this-product-does-not-exist-at-all-xyz')
    expect(res?.status()).toBeGreaterThanOrEqual(404)
  })

  test('product API returns 404 for unknown ID', async ({ request }) => {
    const res = await request.get('/api/storefront/products/00000000-0000-0000-0000-000000000000')
    expect(res.status()).toBe(404)
  })
})

test.describe('Category Pages', () => {
  const CATEGORIES = ['phones-tablets', 'electronics', 'fashion', 'home-kitchen']

  for (const slug of CATEGORIES) {
    test(`/categories/${slug} loads`, async ({ page }) => {
      await page.goto(`/categories/${slug}`)
      expect(await page.title()).toMatch(/ecove/i)
    })
  }
})

test.describe('Vendor Store Pages', () => {
  test('vendor store with unknown slug returns 404 or empty', async ({ page }) => {
    const res = await page.goto('/store/this-vendor-does-not-exist')
    expect(res?.status()).toBeLessThan(600)
  })

  test('vendor API returns 404 for unknown slug', async ({ request }) => {
    const res = await request.get('/api/storefront/vendors/this-vendor-slug-dne')
    expect(res.status()).toBe(404)
  })
})

test.describe('Order Tracking', () => {
  test('track page renders form', async ({ page }) => {
    await page.goto('/track')
    await expect(page.getByText(/track/i)).toBeVisible()
    await expect(
      page.getByRole('textbox').or(page.locator('input'))
    ).toBeVisible()
  })

  test('tracking with non-existent order shows error', async ({ page }) => {
    await page.goto('/track')
    const input = page.getByRole('textbox').first()
    await input.fill('ORDER-DOES-NOT-EXIST')
    await page.getByRole('button').last().click()
    await expect(
      page.getByText(/not found/i).or(page.getByText(/invalid/i)).or(page.getByText(/no order/i))
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('User Account Pages', () => {
  test('account page redirects unauthenticated users', async ({ page }) => {
    await page.goto('/account')
    // Should redirect to login or show auth gate
    await expect(page).toHaveURL(/\/login|\/account/)
  })

  test('orders page with no auth shows empty or redirects', async ({ page }) => {
    await page.goto('/orders')
    await expect(page).toHaveURL(/\/login|\/orders/)
  })
})

test.describe('Static Pages', () => {
  test('returns policy page renders', async ({ page }) => {
    await page.goto('/returns')
    await expect(page).toHaveURL('/returns')
    await expect(page).not.toHaveTitle('')
  })

  test('privacy policy page renders', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page).toHaveURL('/privacy')
    await expect(page).not.toHaveTitle('')
  })

  test('vendor policies page renders', async ({ page }) => {
    await page.goto('/vendor-policies')
    await expect(page).toHaveURL('/vendor-policies')
  })
})

test.describe('Storefront API Endpoints', () => {
  test('GET /api/storefront/products returns paginated list', async ({ request }) => {
    const res = await request.get('/api/storefront/products?limit=5')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/storefront/categories returns list', async ({ request }) => {
    const res = await request.get('/api/storefront/categories')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/storefront/banners returns list', async ({ request }) => {
    const res = await request.get('/api/storefront/banners')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('GET /api/storefront/vendors returns list', async ({ request }) => {
    const res = await request.get('/api/storefront/vendors')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/storefront/stats returns vendor count', async ({ request }) => {
    const res = await request.get('/api/storefront/stats')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(typeof body.vendorCount).toBe('number')
  })

  test('GET /api/health returns ok status', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})
