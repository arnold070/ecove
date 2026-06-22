import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Vendor Policies',
  description: 'Read the Ecove vendor policies covering listing standards, commissions, payouts, and seller conduct.',
}

export default function VendorPoliciesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Policies</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: June 2025</p>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Eligibility</h2>
              <p>To sell on Ecove, you must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Be a registered business or individual trader in Nigeria</li>
                <li>Have a valid bank account in your business name</li>
                <li>Provide accurate business information during registration</li>
                <li>Agree to these Vendor Policies and our <Link href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</Link></li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Product Listing Standards</h2>
              <p>All products listed on Ecove must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Be accurately described with clear, high-quality images</li>
                <li>Be legally available for sale in Nigeria</li>
                <li>Have correct pricing including all applicable fees</li>
                <li>Specify accurate stock quantities</li>
                <li>Include honest condition descriptions (new, used, refurbished)</li>
              </ul>
              <h3 className="font-semibold text-gray-800 mt-4 mb-2">Prohibited Items</h3>
              <p>You may not list any of the following:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Counterfeit, pirated, or infringing goods</li>
                <li>Weapons, ammunition, or explosives</li>
                <li>Controlled substances or illegal drugs</li>
                <li>Stolen goods</li>
                <li>Items that violate Nigerian consumer protection laws</li>
                <li>Adult or sexually explicit content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Order Fulfilment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders must be confirmed within <strong>24 hours</strong> of placement.</li>
                <li>Orders must be shipped within <strong>48 hours</strong> of confirmation.</li>
                <li>You must provide accurate tracking information when available.</li>
                <li>If you cannot fulfil an order, you must cancel it promptly and notify the buyer.</li>
                <li>Repeated late fulfilment or cancellations may result in account suspension.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Returns &amp; Refunds</h2>
              <p>
                Vendors must honour Ecove&apos;s{' '}
                <Link href="/returns" className="text-orange-500 hover:underline">Returns &amp; Refund Policy</Link>.
                Specifically:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Accept returns within 7 days for eligible items</li>
                <li>Process approved refunds within 5 business days</li>
                <li>Cover return shipping costs for defective or incorrect items</li>
                <li>Respond to return requests within 48 hours</li>
              </ul>
              <p className="mt-3">
                Failure to process valid returns will result in Ecove issuing the refund and recovering the
                amount from your vendor balance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Commission &amp; Fees</h2>
              <p>
                Ecove charges a commission on each successful sale. Commission rates vary by product category:
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">Category</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">Commission Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['Electronics & Phones', '5%'],
                      ['Computing', '5%'],
                      ['Fashion & Apparel', '8%'],
                      ['Home & Kitchen', '7%'],
                      ['Beauty & Health', '8%'],
                      ['Baby Products', '7%'],
                      ['Sports & Outdoors', '7%'],
                      ['Groceries & Food', '6%'],
                      ['Gaming', '6%'],
                      ['Other', '8%'],
                    ].map(([cat, rate]) => (
                      <tr key={cat}>
                        <td className="px-4 py-2 text-gray-700">{cat}</td>
                        <td className="px-4 py-2 text-gray-700">{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Commissions are deducted automatically before payouts. Rates are subject to change with 30 days&apos; notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payouts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Earnings are released to your available balance <strong>7 days</strong> after successful order delivery.</li>
                <li>Payout requests are processed within <strong>2–3 business days</strong>.</li>
                <li>Minimum payout amount is <strong>&#8358;2,000</strong>.</li>
                <li>Payouts are made to the bank account on file. Ensure your banking details are accurate.</li>
                <li>Ecove is not liable for failed transfers due to incorrect bank details provided by the vendor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Vendor Conduct</h2>
              <p>Vendors must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Communicate professionally with buyers</li>
                <li>Not attempt to move transactions off the Ecove platform</li>
                <li>Not post fake reviews or manipulate ratings</li>
                <li>Not list products solely to collect contact information</li>
                <li>Respond to buyer messages within 24 hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Account Suspension &amp; Termination</h2>
              <p>Ecove reserves the right to suspend or terminate a vendor account for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Listing prohibited or counterfeit items</li>
                <li>Repeated policy violations</li>
                <li>Excessive negative reviews or unresolved disputes</li>
                <li>Fraudulent activity or chargebacks</li>
                <li>Providing false business information</li>
              </ul>
              <p className="mt-3">
                Suspended vendors may appeal by contacting{' '}
                <a href="mailto:vendors@ecove.com.ng" className="text-orange-500 hover:underline">
                  vendors@ecove.com.ng
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to These Policies</h2>
              <p>
                Ecove may update these policies at any time. Vendors will be notified by email at least{' '}
                <strong>30 days</strong> in advance of material changes. Continued use of the vendor dashboard
                after changes take effect constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
              <address className="not-italic space-y-1">
                <p>Vendor Support: <a href="mailto:vendors@ecove.com.ng" className="text-orange-500 hover:underline">vendors@ecove.com.ng</a></p>
                <p>General: <a href="mailto:support@ecove.com.ng" className="text-orange-500 hover:underline">support@ecove.com.ng</a></p>
                <p>Hours: Monday–Friday, 8am–6pm WAT</p>
              </address>
            </section>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
            <Link href="/vendor/register" className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Become a Vendor
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
