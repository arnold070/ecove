# Ecove E2E Tests (Playwright)

Comprehensive end-to-end test suite for the Ecove multi-vendor marketplace.

## Setup

```bash
# Install dependencies
npm install

# Install browsers (first time)
npx playwright install --with-deps

# Run all tests (requires dev server running)
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Show last test report
npm run test:e2e:report
```

## Test Coverage

| File | Description |
|------|-------------|
| `tests/auth.spec.ts` | Login, register, logout, session, password reset, API auth |
| `tests/navigation.spec.ts` | All public routes, header, footer, redirects, security headers |
| `tests/storefront.spec.ts` | Homepage, search, product detail, categories, vendor stores |
| `tests/cart-checkout.spec.ts` | Cart CRUD, checkout form, coupon codes, API validation |
| `tests/vendor-dashboard.spec.ts` | Vendor auth, API authorization, product CRUD |
| `tests/admin.spec.ts` | Admin auth guards, all admin API endpoints |
| `tests/responsive.spec.ts` | 320px, 375px, 768px, 1024px, 1440px viewports |
| `tests/accessibility.spec.ts` | Keyboard nav, ARIA, labels, focus states |
| `tests/performance.spec.ts` | Load times, no hydration errors, memory, API speed |
| `tests/security.spec.ts` | XSS, SQL injection, auth bypass, security headers |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
PLAYWRIGHT_BASE_URL=http://localhost:3000
E2E_ADMIN_EMAIL=admin@ecove-test.com
E2E_ADMIN_PASSWORD=AdminTestPass123!
```

> **Important**: Use a dedicated test database for E2E tests — never run against production data.

## CI Integration

The config auto-detects `process.env.CI` and:
- Sets `retries: 2` for flaky test resilience
- Sets `workers: 1` for sequential execution
- Fails fast with `forbidOnly: true`

## Browser Matrix

Tests run on: Chromium, Firefox, WebKit (Safari), Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12), plus specific viewport sizes.
