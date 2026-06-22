import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: "Read Ecove's Privacy Policy to understand how we collect, use, and protect your personal data.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                Ecove (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the Ecove online marketplace
                at <strong>ecove.com.ng</strong>. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your personal information when you use our platform. By accessing or using Ecove, you
                agree to the terms of this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <h3 className="font-semibold text-gray-800 mb-2">2a. Information you provide directly</h3>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Account details: name, email address, phone number, and password</li>
                <li>Shipping addresses and billing information</li>
                <li>Payment details (processed securely by Paystack/Flutterwave — we do not store card numbers)</li>
                <li>Messages sent to vendors or our support team</li>
                <li>Vendor business information (business name, CAC registration, bank account details)</li>
              </ul>
              <h3 className="font-semibold text-gray-800 mb-2">2b. Information collected automatically</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device and browser information (browser type, operating system, screen resolution)</li>
                <li>IP address and approximate location (country/city level)</li>
                <li>Pages visited, search queries, and interactions on our platform</li>
                <li>Session cookies and authentication tokens stored in secure, HttpOnly cookies</li>
                <li>Error logs and crash reports (via Sentry)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process orders, payments, and deliver purchased goods</li>
                <li>To create and manage your Ecove account</li>
                <li>To send order confirmations, shipping updates, and receipts</li>
                <li>To respond to customer support requests</li>
                <li>To send promotional emails and marketing communications (you can opt out at any time)</li>
                <li>To detect and prevent fraud, abuse, and security threats</li>
                <li>To improve our platform, personalise your experience, and conduct analytics</li>
                <li>To comply with applicable Nigerian laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing Your Information</h2>
              <p>We do not sell your personal data. We share information only in these circumstances:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Vendors:</strong> We share your name, delivery address, and order details with the vendor fulfilling your order.</li>
                <li><strong>Payment processors:</strong> Paystack and Flutterwave receive payment information to process transactions.</li>
                <li><strong>Delivery partners:</strong> Logistics providers receive your name and delivery address to fulfill shipments.</li>
                <li><strong>Service providers:</strong> We use trusted third parties (e.g. Cloudinary for image storage, Sentry for error monitoring) who are bound by confidentiality agreements.</li>
                <li><strong>Legal compliance:</strong> We may disclose data when required by Nigerian law, court order, or to protect our legal rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Keep you logged in securely (authentication cookie, HttpOnly and Secure)</li>
                <li>Remember your cart and wishlist preferences (stored in your browser&apos;s localStorage)</li>
                <li>Analyse traffic and improve our services (analytics cookies)</li>
              </ul>
              <p className="mt-3">
                You can disable non-essential cookies in your browser settings. Disabling the authentication
                cookie will prevent you from staying logged in.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active or as needed to provide
                services. If you close your account, we will delete or anonymise your data within{' '}
                <strong>90 days</strong>, except where we are required to retain it for legal or regulatory
                purposes (e.g. transaction records for tax compliance).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
              <p>Under applicable Nigerian data protection law (NDPA 2023), you have the right to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Access</strong> the personal data we hold about you</li>
                <li><strong>Correct</strong> inaccurate or incomplete data</li>
                <li><strong>Delete</strong> your account and associated data</li>
                <li><strong>Withdraw consent</strong> for marketing communications</li>
                <li><strong>Object</strong> to processing based on legitimate interests</li>
                <li><strong>Data portability</strong> — receive your data in a structured format</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email us at{' '}
                <a href="mailto:privacy@ecove.com.ng" className="text-orange-500 hover:underline">
                  privacy@ecove.com.ng
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Security</h2>
              <p>
                We implement industry-standard security measures including HTTPS encryption, HttpOnly and
                Secure cookies, bcrypt password hashing, rate limiting, and Content Security Policy headers.
                Despite these measures, no method of transmission over the internet is 100% secure. We
                encourage you to use a strong, unique password for your Ecove account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
              <p>
                Ecove is not directed to children under the age of 13. We do not knowingly collect personal
                data from children under 13. If you believe a child has provided us with personal information,
                please contact us and we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes
                by email or by posting a notice on our website. Your continued use of Ecove after changes are
                posted constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <address className="not-italic space-y-1">
                <p>Data Privacy Officer</p>
                <p>Email: <a href="mailto:privacy@ecove.com.ng" className="text-orange-500 hover:underline">privacy@ecove.com.ng</a></p>
                <p>General: <a href="mailto:support@ecove.com.ng" className="text-orange-500 hover:underline">support@ecove.com.ng</a></p>
                <p>Hours: Monday–Friday, 8am–6pm WAT</p>
              </address>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
            <Link href="/" className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Back to Home
            </Link>
            <Link href="/returns" className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Returns Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
