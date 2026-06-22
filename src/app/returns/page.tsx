import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Returns & Refund Policy',
  description: "Learn about Ecove's returns, refunds, and exchange policy for purchases made on our marketplace.",
}

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns &amp; Refund Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Overview</h2>
              <p>
                At Ecove, we want you to be completely satisfied with every purchase. If you are not satisfied
                for any reason, you may return most items within <strong>7 days</strong> of delivery for a full
                refund or exchange, subject to the conditions below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Eligibility</h2>
              <p>To be eligible for a return, your item must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Be returned within 7 days of the delivery date</li>
                <li>Be unused and in the same condition you received it</li>
                <li>Be in its original packaging with all tags, accessories, and manuals included</li>
                <li>Be accompanied by your order number or proof of purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Non-Returnable Items</h2>
              <p>The following categories are <strong>not eligible</strong> for returns:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Perishable goods (food, groceries, flowers)</li>
                <li>Digital products, software licenses, and download codes</li>
                <li>Underwear, swimwear, and intimate apparel (hygiene reasons)</li>
                <li>Hazardous materials</li>
                <li>Items marked as &ldquo;Final Sale&rdquo; or &ldquo;Non-Returnable&rdquo; on the product page</li>
                <li>Items that have been used, altered, or damaged after delivery</li>
                <li>Custom-made or personalised products</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. How to Initiate a Return</h2>
              <ol className="list-decimal pl-6 mt-2 space-y-2">
                <li>Log in to your Ecove account and go to <strong>My Orders</strong>.</li>
                <li>Select the order and click <strong>&ldquo;Request Return&rdquo;</strong>.</li>
                <li>Choose your return reason and upload photos if the item is damaged or defective.</li>
                <li>Submit your request. You will receive a confirmation email within <strong>24 hours</strong>.</li>
                <li>Once approved, follow the instructions to ship the item back to the vendor.</li>
              </ol>
              <p className="mt-3">
                Need help?{' '}
                <a href="mailto:support@ecove.com.ng" className="text-orange-500 hover:underline">
                  support@ecove.com.ng
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Defective or Wrong Items</h2>
              <p>
                If you received a defective, damaged, or incorrect item, please contact us within{' '}
                <strong>48 hours</strong> of delivery. We will arrange a free return pickup and send a
                replacement or full refund at no additional cost.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Refund Processing</h2>
              <p>Once your return is received and inspected:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You will be notified by email of the approval or rejection of your refund.</li>
                <li>If approved, refunds are processed to your original payment method within <strong>5–10 business days</strong>.</li>
                <li>Bank transfer refunds may take an additional 2–5 business days depending on your bank.</li>
                <li>Wallet credits (if chosen) are applied instantly.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Return Shipping</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>For defective or wrong items, Ecove covers the return shipping cost.</li>
                <li>For change-of-mind returns, the buyer is responsible for return shipping fees.</li>
                <li>We recommend using a trackable shipping service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Exchanges</h2>
              <p>
                We only replace items if they are defective or damaged. Contact us at{' '}
                <a href="mailto:support@ecove.com.ng" className="text-orange-500 hover:underline">
                  support@ecove.com.ng
                </a>{' '}
                to arrange an exchange.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Vendor Responsibility</h2>
              <p>
                Ecove is a marketplace platform. Individual vendors are responsible for fulfilling returns
                in line with this policy. If a vendor fails to process a valid return, Ecove will intervene
                to ensure you receive your refund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
              <address className="not-italic space-y-1">
                <p>Email: <a href="mailto:support@ecove.com.ng" className="text-orange-500 hover:underline">support@ecove.com.ng</a></p>
                <p>Phone: +234 800 000 0000</p>
                <p>Hours: Monday–Friday, 8am–6pm WAT</p>
              </address>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
            <Link href="/" className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Continue Shopping
            </Link>
            <Link href="/privacy" className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
