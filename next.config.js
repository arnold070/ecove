const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    // 185 added so Next.js generates an exact 185px variant for the banner cards
    // instead of upscaling from the next bucket (256px)
    imageSizes: [16, 32, 48, 64, 96, 128, 185, 256, 384],
    minimumCacheTTL: 2_592_000, // 30 days — static marketing images change rarely
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', 'ecove.com.ng', 'www.ecove.com.ng'] },
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'

    // Content Security Policy — strict but allow necessary sources
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.paystack.co https://checkout.paystack.com https://js.flutterwave.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://via.placeholder.com https://lh3.googleusercontent.com",
      "connect-src 'self' https://api.paystack.co https://api.flutterwave.com https://o*.ingest.sentry.io wss://ecove.com.ng",
      "frame-src https://checkout.paystack.com https://checkout.flutterwave.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ')

    const securityHeaders = [
      { key: 'X-Content-Type-Options',   value: 'nosniff' },
      { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
      { key: 'X-XSS-Protection',          value: '1; mode=block' },
      { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.paystack.com" "https://checkout.flutterwave.com")' },
      ...(!isDev ? [{ key: 'Content-Security-Policy', value: csp }] : []),
    ]

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        // Allow embedding of payment iframes
        source: '/checkout',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/vendor/dashboard', permanent: false },
      { source: '/seller',    destination: '/vendor/register',  permanent: false },
      { source: '/apply',     destination: '/vendor/register',  permanent: false },
    ]
  },
  // Disable powered-by header
  poweredByHeader: false,
}

module.exports = withSentryConfig(nextConfig, {
  // Suppress Sentry build output
  silent: true,
  // Automatically tree-shake Sentry logger statements in production
  disableLogger: true,
  // Upload source maps (requires SENTRY_AUTH_TOKEN env var)
  widenClientFileUpload: true,
  // Transpiles SDK to be compatible with IE11
  transpileClientSDK: false,
  // Routes browser requests to Sentry through a Next.js rewrite
  tunnelRoute: '/monitoring-tunnel',
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically annotate React components
  reactComponentAnnotation: { enabled: true },
})
