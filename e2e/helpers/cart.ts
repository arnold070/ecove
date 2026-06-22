import { Page } from '@playwright/test'

export async function addProductToCart(page: Page, productSlug?: string) {
  if (productSlug) {
    await page.goto(`/products/${productSlug}`)
    await page.getByRole('button', { name: /add to cart/i }).first().click()
  } else {
    // Add via homepage featured products
    await page.goto('/')
    const addBtn = page.getByRole('button', { name: /^Add$/i }).first()
    await addBtn.click()
  }
}

export async function getCartItemCount(page: Page): Promise<number> {
  const badge = page.locator('[data-testid="cart-count"]').or(
    page.locator('.absolute.top-0.right-1.bg-red-500')
  )
  const text = await badge.textContent().catch(() => '0')
  return parseInt(text || '0', 10)
}

export async function openCartDrawer(page: Page) {
  await page.getByRole('button', { name: /cart/i }).click()
  await page.waitForSelector('[data-testid="cart-drawer"]', { state: 'visible' }).catch(() =>
    page.waitForSelector('text=My Cart', { state: 'visible' })
  )
}

export async function clearCart(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('ecove-cart')
  })
  await page.reload()
}
