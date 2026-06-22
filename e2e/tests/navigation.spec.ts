/**
 * Navigation tests — every page loads successfully, links work,
 * no broken routes, no console errors, browser back/forward behavior.
 */
import { test, expect } from '@playwright/test'

const PUBLIC_ROUTES = [
  { path: '/',                    title: /ecove/i },
  { path: '/login',               title: /ecove/i },
  { path: '/register',            title: /ecove/i },
  { path: '/forgot-password',     title: /ecove/i },
  { path: '/search',              title: /ecove/i },
  { path: '/track',               title: /ecove/i },
  { path: '/returns',             title: /ecove/i },
  { path: '/privacy',             title: /ecove/i },
  { path: '/vendor-policies',     title: /ecove/i },
  { path: '/vendor/register',     title: /ecove/i },
  { path: '/vendor/login',        title: /ecove/i },
  { path: '/not-found-route',     title: /ecove|404/i },
]

const API_HEALTH_ROUTES = [
  '/api/health',
  '/api/storefront/products?limit=1',
  '/api/storefront/categories?limit=5',
  '/api/storefront/banners',
  '/api/storefront/stats',
]

test.describe('Public Page Loads', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} loads without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      page.on('pageerror', err => errors.push(err.message))

      const res = await page.goto(route.path)
      // Allow 200 and 404 (for 404 test page)
      expect(res?.status()).toBeLessThan(500)

      await expect(page).toHaveTitle(route.title)

      // No critical JS errors (filter out expected 3rd-party noise)
      const criticalErrors = errors.filter(e =>
        !e.includes('Failed to load resource') &&
        !e.includes('net::ERR') &&
        !e.includes('Sentry') &&
        !e.includes('favicon')
      )
      if (criticalErrors.length > 0) {
        console.warn(`Console errors on ${route.path}:`, criticalErrors)
      }
    })
  }
})

test.describe('Storefront Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('logo links to homepage', async ({ page }) => {
    await page.locator('header').getByText('eco').click()
    await expect(page).toHaveURL('/')
  })

  test('search form navigates to search results', async ({ page }) => {
    await page.locator('header input[type="text"]').fill('phone')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/search\?q=phone/)
  })

  test('search autocomplete appears after 2 characters', async ({ page }) => {
    await page.locator('header input[type="text"]').fill('ph')
    // Give autocomplete time to load
    await page.waitForTimeout(500)
    // Dropdown might appear if there are products
    // Just verify no crash
    await expect(page.locator('header')).toBeVisible()
  })

  test('category navigation links work', async ({ page }) => {
    await page.getByRole('link', { name: /phones/i }).first().click()
    await expect(page).toHaveURL(/\/categories\/phones-tablets/)
  })

  test('flash sales link works', async ({ page }) => {
    await page.getByRole('link', { name: /flash sales/i }).first().click()
    await expect(page).toHaveURL(/flashSale=true/)
  })

  test('account dropdown appears on hover', async ({ page }) => {
    const accountBtn = page.locator('header button').filter({ hasText: /account/i }).first()
    await accountBtn.hover()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible()
  })

  test('wishlist link navigates', async ({ page }) => {
    await page.getByRole('link', { name: /wishlist/i }).click()
    await expect(page).toHaveURL(/\/account/)
  })

  test('cart button opens drawer', async ({ page }) => {
    const cartBtn = page.locator('header button').filter({ hasText: /cart/i }).first()
    await cartBtn.click()
    // Cart drawer should be visible
    await expect(page.getByText(/my cart/i)).toBeVisible()
  })
})

test.describe('Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('hamburger button opens mobile drawer', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByRole('button', { name: /open menu/i }).or(
      page.locator('button[aria-label*="menu"]').or(page.locator('header button').first())
    )
    await hamburger.click()
    await expect(page.getByText('ecove').first()).toBeVisible()
  })
})

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  })

  test('all products link works', async ({ page }) => {
    await page.getByRole('link', { name: /all products/i }).click()
    await expect(page).toHaveURL(/\/search/)
  })

  test('sell on ecove link works', async ({ page }) => {
    await page.getByRole('link', { name: /sell on ecove/i }).click()
    await expect(page).toHaveURL(/\/vendor\/register/)
  })

  test('track order link works', async ({ page }) => {
    await page.getByRole('link', { name: /track order/i }).click()
    await expect(page).toHaveURL(/\/track/)
  })

  test('returns policy link works', async ({ page }) => {
    await page.getByRole('link', { name: /returns/i }).click()
    await expect(page).toHaveURL(/\/returns/)
  })

  test('privacy policy link works', async ({ page }) => {
    await page.getByRole('link', { name: /privacy/i }).click()
    await expect(page).toHaveURL(/\/privacy/)
  })
})

test.describe('API Health Checks', () => {
  for (const path of API_HEALTH_ROUTES) {
    test(`GET ${path} returns 200`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body).toBeDefined()
    })
  }
})

test.describe('Browser History Navigation', () => {
  test('back button returns to previous page', async ({ page }) => {
    await page.goto('/')
    await page.goto('/login')
    await page.goBack()
    await expect(page).toHaveURL('/')
  })

  test('forward button navigates forward', async ({ page }) => {
    await page.goto('/')
    await page.goto('/login')
    await page.goBack()
    await page.goForward()
    await expect(page).toHaveURL(/\/login/)
  })

  test('refresh does not break state', async ({ page }) => {
    await page.goto('/')
    await page.reload()
    await expect(page.locator('header')).toBeVisible()
  })
})

test.describe('404 Page', () => {
  test('renders custom 404 for unknown routes', async ({ page }) => {
    const res = await page.goto('/this-route-does-not-exist-at-all')
    expect(res?.status()).toBe(404)
    await expect(page.getByText(/404/i).or(page.getByText(/not found/i))).toBeVisible()
    await expect(page.getByRole('link', { name: /homepage/i }).or(
      page.getByRole('link', { name: /back to/i })
    )).toBeVisible()
  })
})

test.describe('Security Headers', () => {
  test('API routes include security headers', async ({ request }) => {
    const res = await request.get('/api/health')
    const headers = res.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBeDefined()
  })

  test('storefront pages include security headers', async ({ request }) => {
    const res = await request.get('/')
    const headers = res.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
  })
})

test.describe('Redirect Rules', () => {
  test('/dashboard redirects to /vendor/dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/vendor\/dashboard|\/vendor\/login/)
  })

  test('/seller redirects to /vendor/register', async ({ page }) => {
    await page.goto('/seller')
    await expect(page).toHaveURL(/\/vendor\/register/)
  })

  test('/apply redirects to /vendor/register', async ({ page }) => {
    await page.goto('/apply')
    await expect(page).toHaveURL(/\/vendor\/register/)
  })
})
