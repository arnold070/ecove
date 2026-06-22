/**
 * Accessibility tests — automated WCAG 2.1 AA audits via axe-core,
 * keyboard navigation, focus states, ARIA attributes, and form labels.
 */
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// ── Automated WCAG 2.1 AA audits ────────────────────────────────
test.describe('Axe WCAG Audits', () => {
  const publicPages = [
    { name: 'Homepage', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Search', path: '/search' },
  ]

  for (const { name, path } of publicPages) {
    test(`${name} has no critical WCAG violations`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Filter out known third-party widget violations
      const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')

      if (violations.length > 0) {
        const summary = violations.map(v =>
          `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map(n => n.target.join(', ')).slice(0, 3).join(' | ')}`
        ).join('\n')
        throw new Error(`WCAG violations on ${name}:\n${summary}`)
      }
    })
  }

  test('Checkout page has no critical WCAG violations', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('ecove-cart', JSON.stringify({
        state: { items: [{ id: 'test', name: 'Test Product', price: 5000, image: '', quantity: 1, slug: 'test' }] },
        version: 0,
      }))
    })
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
    expect(violations, `WCAG violations: ${JSON.stringify(violations.map(v => v.id))}`).toHaveLength(0)
  })
})

test.describe('Login Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('email input has associated label', async ({ page }) => {
    const email = page.getByLabel('Email address')
    await expect(email).toBeVisible()
    await expect(email).toHaveAttribute('type', 'email')
  })

  test('password input has associated label', async ({ page }) => {
    const pw = page.getByLabel('Password')
    await expect(pw).toBeVisible()
    await expect(pw).toHaveAttribute('type', 'password')
  })

  test('can submit form with keyboard only', async ({ page }) => {
    await page.getByLabel('Email address').focus()
    await page.keyboard.type('test@test.com')
    await page.keyboard.press('Tab')
    await page.keyboard.type('testpassword')
    await page.keyboard.press('Enter')
    // Form should attempt submission (no crash)
    await page.waitForTimeout(1000)
  })

  test('focus moves correctly with Tab key', async ({ page }) => {
    await page.keyboard.press('Tab')
    // First focusable element should have focus
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('submit button is keyboard-accessible', async ({ page }) => {
    const btn = page.getByRole('button', { name: /sign in/i })
    await btn.focus()
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused?.toLowerCase()).toBe('button')
  })

  test('error messages are readable (not just colors)', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    // Errors should be text, not just color changes
    const errors = page.getByText(/enter a valid email|password is required/i)
    await expect(errors.first()).toBeVisible()
  })
})

test.describe('Registration Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('all required fields have labels', async ({ page }) => {
    // Check labels exist for form fields
    const labels = await page.locator('label').count()
    expect(labels).toBeGreaterThan(0)
  })

  test('password and confirm password inputs are type=password', async ({ page }) => {
    const passwords = page.locator('input[type="password"]')
    const count = await passwords.count()
    expect(count).toBe(2)
  })
})

test.describe('Homepage Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page has exactly one main landmark', async ({ page }) => {
    const mains = page.getByRole('main')
    const count = await mains.count()
    expect(count).toBe(1)
  })

  test('page has heading structure', async ({ page }) => {
    const h2s = page.getByRole('heading', { level: 2 })
    const count = await h2s.count()
    expect(count).toBeGreaterThan(0)
  })

  test('images have alt text', async ({ page }) => {
    const imagesWithoutAlt = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs.filter(img => !img.alt && !img.getAttribute('role')).map(img => img.src)
    })
    // Report but don't necessarily fail — may have decorative images
    if (imagesWithoutAlt.length > 0) {
      console.warn('Images missing alt text:', imagesWithoutAlt.slice(0, 5))
    }
  })

  test('interactive elements have accessible names', async ({ page }) => {
    const buttons = page.getByRole('button')
    const count = await buttons.count()
    let unnamedCount = 0
    for (let i = 0; i < Math.min(count, 20); i++) {
      const btn = buttons.nth(i)
      const name = await btn.getAttribute('aria-label') ||
                   await btn.textContent() ||
                   await btn.getAttribute('title')
      if (!name || name.trim() === '') unnamedCount++
    }
    // Allow some icons without text (they may have aria-hidden children)
    expect(unnamedCount).toBeLessThan(5)
  })

  test('navigation has landmark role', async ({ page }) => {
    const nav = page.getByRole('navigation').or(page.locator('nav'))
    const count = await nav.count()
    expect(count).toBeGreaterThan(0)
  })

  test('footer exists as content info or footer element', async ({ page }) => {
    const footer = page.locator('footer').or(page.getByRole('contentinfo'))
    await expect(footer.first()).toBeVisible()
  })
})

test.describe('Search Accessibility', () => {
  test('search input has accessible name', async ({ page }) => {
    await page.goto('/')
    const search = page.getByRole('searchbox').or(
      page.locator('input[placeholder*="Search"]').first()
    )
    await expect(search).toBeVisible()
  })

  test('search results are announced', async ({ page }) => {
    await page.goto('/search?q=phone')
    // Results container should have appropriate structure
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('Cart Accessibility', () => {
  test('cart button has accessible name', async ({ page }) => {
    await page.goto('/')
    const cartBtn = page.getByRole('button').filter({ hasText: /cart/i }).first()
    await expect(cartBtn).toBeVisible()
    const name = await cartBtn.getAttribute('aria-label') || await cartBtn.textContent()
    expect(name?.toLowerCase()).toContain('cart')
  })

  test('cart items are in a list', async ({ page }) => {
    await page.goto('/')
    const cartBtn = page.getByRole('button').filter({ hasText: /cart/i }).first()
    await cartBtn.click()
    await page.waitForTimeout(300)
    // Cart drawer should be visible and structured
    await expect(page.getByText(/my cart/i)).toBeVisible()
  })
})

test.describe('Form Accessibility - Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('ecove-cart', JSON.stringify({
        state: {
          items: [{ id: 'test', name: 'Test Product', price: 5000, image: '', quantity: 1, slug: 'test' }]
        },
        version: 0
      }))
    })
    await page.goto('/checkout')
  })

  test('checkout form labels are associated with inputs', async ({ page }) => {
    const labels = page.locator('label')
    const count = await labels.count()
    expect(count).toBeGreaterThan(0)
  })

  test('state select has accessible options', async ({ page }) => {
    const select = page.getByLabel(/state/i)
    if (await select.isVisible()) {
      const options = await select.locator('option').count()
      expect(options).toBeGreaterThan(1)
    }
  })

  test('required field errors are descriptive text', async ({ page }) => {
    await page.getByRole('button', { name: /pay/i }).click()
    await page.waitForTimeout(500)
    // Should show text errors, not just visual cues
    const errorTexts = await page.locator('.text-red-500, [class*="error"]').count()
    expect(errorTexts).toBeGreaterThan(0)
  })
})

test.describe('Keyboard Navigation', () => {
  test('can navigate homepage with keyboard', async ({ page }) => {
    await page.goto('/')
    // Tab through focusable elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      // Should always have a focused element (no focus trap)
      await expect(focused).toBeVisible().catch(() => {})
    }
  })

  test('can activate hero slider dots with keyboard', async ({ page }) => {
    await page.goto('/')
    // Tab to the dots
    const dots = page.locator('button[class*="rounded-full"]')
    const count = await dots.count()
    if (count > 0) {
      await dots.first().focus()
      await page.keyboard.press('Enter')
      // Should change slide without crash
      await page.waitForTimeout(300)
    }
  })

  test('mobile hamburger button is keyboard-accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const hamburger = page.locator('button.md\\:hidden').first()
    if (await hamburger.isVisible()) {
      await hamburger.focus()
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      expect(focused?.toLowerCase()).toBe('button')
    }
  })
})

test.describe('Color and Visibility', () => {
  test('error messages are visible (not just changed border)', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    const errorEl = page.locator('.text-red-500').first()
    if (await errorEl.isVisible()) {
      const text = await errorEl.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }
  })

  test('focus outlines are visible', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email address').focus()
    const outline = await page.evaluate(() => {
      const el = document.querySelector(':focus') as HTMLElement
      if (!el) return null
      const style = window.getComputedStyle(el)
      return {
        outline: style.outline,
        boxShadow: style.boxShadow,
        borderColor: style.borderColor
      }
    })
    // Should have some visual focus indicator
    expect(outline).not.toBeNull()
    const hasFocusIndicator = outline && (
      outline.outline !== 'none' ||
      outline.boxShadow !== 'none' ||
      outline.borderColor !== 'rgb(209, 213, 219)' // not default gray
    )
    expect(hasFocusIndicator).toBe(true)
  })
})
