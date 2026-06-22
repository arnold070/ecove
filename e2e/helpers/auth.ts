import { Page, BrowserContext } from '@playwright/test'

export const TEST_USERS = {
  customer: {
    email: 'test.customer@ecove-test.com',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Customer',
  },
  vendor: {
    email: 'test.vendor@ecove-test.com',
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'Vendor',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'admin@ecove-test.com',
    password: process.env.E2E_ADMIN_PASSWORD || 'AdminPass123!',
  },
}

export async function loginAsCustomer(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(TEST_USERS.customer.email)
  await page.getByLabel('Password').fill(TEST_USERS.customer.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('/')
}

export async function loginAsVendor(page: Page) {
  await page.goto('/vendor/login')
  await page.getByLabel(/email/i).fill(TEST_USERS.vendor.email)
  await page.getByLabel(/password/i).fill(TEST_USERS.vendor.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('/vendor/dashboard')
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(TEST_USERS.admin.email)
  await page.getByLabel('Password').fill(TEST_USERS.admin.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('/admin')
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /account/i }).hover()
  await page.getByRole('link', { name: /sign out/i }).click()
  await page.waitForURL('/')
}

export async function clearAuthCookies(context: BrowserContext) {
  await context.clearCookies()
}
