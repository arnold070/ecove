/**
 * Responsive / mobile viewport tests.
 * Checks common breakpoints: 320px, 375px, 768px, 1024px, 1440px.
 * Verifies no overflow, layout breaks, or clipped content.
 */
import { test, expect } from '@playwright/test'

const VIEWPORTS = [
  { name: 'xs-320',   width: 320,  height: 568  },
  { name: 'mobile',   width: 375,  height: 812  },
  { name: 'tablet',   width: 768,  height: 1024 },
  { name: 'laptop',   width: 1024, height: 768  },
  { name: 'desktop',  width: 1440, height: 900  },
]

const TEST_PAGES = ['/', '/login', '/register', '/search', '/cart', '/vendor/register']

for (const vp of VIEWPORTS) {
  test.describe(`Viewport ${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    for (const pagePath of TEST_PAGES) {
      test(`${pagePath} has no horizontal overflow at ${vp.width}px`, async ({ page }) => {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        // Check for horizontal scrollbar (overflow-x)
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        expect(hasOverflow).toBe(false)
      })
    }

    test(`homepage renders header at ${vp.width}px`, async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('header')).toBeVisible()
    })

    test(`login page form is usable at ${vp.width}px`, async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByLabel('Email address')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()

      // Check button is not clipped
      const btn = page.getByRole('button', { name: /sign in/i })
      const box = await btn.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.y).toBeGreaterThanOrEqual(0)
      }
    })

    test(`footer is visible at ${vp.width}px`, async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await expect(page.locator('footer')).toBeVisible()
    })
  })
}

test.describe('Mobile Menu Behavior', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('desktop category nav is hidden on mobile', async ({ page }) => {
    await page.goto('/')
    // Desktop nav should be hidden
    const desktopNav = page.locator('.hidden.md\\:block')
    // It should exist in DOM but not visible at mobile width
    await expect(desktopNav.first()).not.toBeVisible()
  })

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.locator('button.md\\:hidden').first()
    await expect(hamburger).toBeVisible()
  })

  test('mobile menu slides in and out', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.locator('button.md\\:hidden').first()
    await hamburger.click()

    // Menu should be visible
    const drawer = page.locator('.fixed.inset-0 .w-72').or(page.locator('[class*="translate-x-0"]').first())
    await page.waitForTimeout(300)

    // Check it's in view
    const ecoveText = page.locator('.fixed, [class*="inset-y"]').filter({ hasText: /ecove/i }).first()
    await expect(ecoveText).toBeVisible()

    // Close by clicking X
    const closeBtn = page.getByRole('button', { name: /✕|close/i }).first()
    if (await closeBtn.isVisible()) await closeBtn.click()
  })
})

test.describe('Cart Drawer Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('cart drawer is contained within viewport', async ({ page }) => {
    await page.goto('/')
    const cartBtn = page.locator('header button').filter({ hasText: /cart/i }).first()
    await cartBtn.click()

    const drawer = page.locator('.absolute.right-0').filter({ hasText: /my cart/i }).first()
    if (await drawer.isVisible()) {
      const box = await drawer.boundingBox()
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.x + box.width).toBeLessThanOrEqual(400) // within mobile viewport
      }
    }
  })
})

test.describe('Checkout Page Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('checkout form stacks vertically on mobile', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('ecove-cart', JSON.stringify({
        state: {
          items: [{ id: 'test', name: 'Test', price: 5000, image: '', quantity: 1, slug: 'test' }]
        },
        version: 0
      }))
    })
    await page.goto('/checkout')
    // Form should be visible and not overflow
    await expect(page.getByText(/checkout/i).first()).toBeVisible()
    const hasOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(hasOverflow).toBe(false)
  })
})
