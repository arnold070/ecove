export async function register() {
  // Only validate on the Node.js runtime (not Edge), and only on server startup
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const REQUIRED = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'PAYSTACK_SECRET_KEY',
    'PAYSTACK_WEBHOOK_SECRET',
    'FLUTTERWAVE_SECRET_KEY',
    'RESEND_API_KEY',
  ]

  const missing = REQUIRED.filter(k => !process.env[k])
  if (missing.length > 0) {
    console.error(
      `\n\nEcove: missing required environment variables:\n  ${missing.join('\n  ')}\n\nSet them in .env.local (dev) or your hosting provider (production).\n`
    )
  }

  if (process.env.NODE_ENV === 'production') {
    const warnings: string[] = []

    if ((process.env.JWT_SECRET?.length ?? 0) < 32) {
      warnings.push('JWT_SECRET is shorter than 32 characters — use a longer random value')
    }
    if (process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_')) {
      warnings.push('PAYSTACK_SECRET_KEY is a test key — replace with a live key before accepting payments')
    }
    if (process.env.FLUTTERWAVE_SECRET_KEY?.includes('TEST')) {
      warnings.push('FLUTTERWAVE_SECRET_KEY is a test key — replace with a live key before accepting payments')
    }

    for (const w of warnings) {
      console.warn(`⚠️  Ecove: ${w}`)
    }
  }
}
