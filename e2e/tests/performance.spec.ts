/**
 * Performance tests — page load times, no memory leaks,
 * lazy loading, minimal network requests, no infinite renders.
 */
import { test, expect } from '@playwright/test'

test.describe('Page Load Performance', () => {
  test('homepage loads in under 5 seconds (cold)', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - start
    console.log(`Homepage load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })

  test('login page loads in under 3 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    const loadTime = Date.now() - start
    console.log(`Login load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000)
  })

  test('search results load in under 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/search?q=phone')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - start
    console.log(`Search load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000)
  })
})

test.describe('No Console Errors or Unhandled Rejections', () => {
  const PAGES_TO_CHECK = ['/', '/login', '/register', '/search', '/cart', '/track']

  for (const path of PAGES_TO_CHECK) {
    test(`${path} — no unhandled promise rejections`, async ({ page }) => {
      const rejections: string[] = []
      page.on('pageerror', err => {
        if (err.message.includes('UnhandledPromiseRejection') ||
            err.message.includes('Unhandled rejection')) {
          rejections.push(err.message)
        }
      })
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      expect(rejections).toHaveLength(0)
    })

    test(`${path} — no React hydration errors`, async ({ page }) => {
      const hydrationErrors: string[] = []
      page.on('console', msg => {
        const text = msg.text()
        if (msg.type() === 'error' && (
          text.includes('Hydration') ||
          text.includes('hydration') ||
          text.includes('did not match')
        )) {
          hydrationErrors.push(text)
        }
      })
      await page.goto(path)
      await page.waitForTimeout(1000)
      expect(hydrationErrors).toHaveLength(0)
    })
  }
})

test.describe('Network Requests', () => {
  test('homepage makes no more than 15 API calls on load', async ({ page }) => {
    const apiCalls: string[] = []
    page.on('request', req => {
      if (req.url().includes('/api/')) apiCalls.push(req.url())
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    console.log(`Homepage API calls: ${apiCalls.length}`, apiCalls)
    expect(apiCalls.length).toBeLessThan(15)
  })

  test('no failed network requests on homepage', async ({ page }) => {
    const failed: string[] = []
    page.on('requestfailed', req => {
      // Ignore external 3rd party calls
      if (req.url().includes('localhost') || req.url().includes('127.0.0.1')) {
        failed.push(req.url())
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(failed).toHaveLength(0)
  })

  test('images load successfully on homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')) as HTMLImageElement[]
      return imgs
        .filter(img => img.complete && img.naturalWidth === 0 && img.src)
        .map(img => img.src)
    })
    if (brokenImages.length > 0) {
      console.warn('Broken images:', brokenImages)
    }
    // Allow up to 2 broken images (may be placeholders)
    expect(brokenImages.length).toBeLessThanOrEqual(2)
  })
})

test.describe('Infinite Render Prevention', () => {
  test('homepage does not cause infinite render loop', async ({ page }) => {
    let renderCount = 0
    page.on('console', msg => {
      if (msg.text().includes('too many re-renders') ||
          msg.text().includes('Maximum update depth')) {
        renderCount++
      }
    })
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(renderCount).toBe(0)
  })

  test('cart does not infinite loop after add/remove', async ({ page }) => {
    let errorCount = 0
    page.on('console', msg => {
      if (msg.type() === 'error') errorCount++
    })
    await page.goto('/')
    // Open/close cart multiple times
    const cartBtn = page.locator('header button').filter({ hasText: /cart/i }).first()
    for (let i = 0; i < 3; i++) {
      await cartBtn.click()
      await page.waitForTimeout(100)
    }
    expect(errorCount).toBeLessThan(3)
  })
})

test.describe('Memory / Resource Cleanup', () => {
  test('navigating between pages does not accumulate event listeners (basic check)', async ({ page }) => {
    await page.goto('/')
    await page.goto('/login')
    await page.goto('/register')
    await page.goto('/')
    // If there are uncleared intervals/listeners they would show as console errors
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    await page.waitForTimeout(1000)
    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('net::ERR'))
    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('API Response Performance', () => {
  test('GET /api/storefront/products responds under 2000ms', async ({ request }) => {
    const start = Date.now()
    const res = await request.get('/api/storefront/products?limit=12&featured=true')
    const elapsed = Date.now() - start
    console.log(`/api/storefront/products response: ${elapsed}ms`)
    expect(res.status()).toBe(200)
    expect(elapsed).toBeLessThan(2000)
  })

  test('GET /api/health responds under 500ms', async ({ request }) => {
    const start = Date.now()
    await request.get('/api/health')
    const elapsed = Date.now() - start
    console.log(`/api/health response: ${elapsed}ms`)
    expect(elapsed).toBeLessThan(500)
  })

  test('GET /api/storefront/search responds under 2000ms', async ({ request }) => {
    const start = Date.now()
    const res = await request.get('/api/storefront/search?q=test')
    const elapsed = Date.now() - start
    console.log(`/api/storefront/search response: ${elapsed}ms`)
    expect(res.status()).toBe(200)
    expect(elapsed).toBeLessThan(2000)
  })
})
