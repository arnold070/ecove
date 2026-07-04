import type { Metadata } from 'next'
import Link from 'next/link'
import PartnerInquiryForm from './PartnerInquiryForm'

export const metadata: Metadata = {
  title: 'Partner With Us – Ecove Marketplace',
  description: 'Bring your products to a curated marketplace. Tell us about your business and our team will be in touch.',
}

const OPPORTUNITIES = [
  { icon: '🏷️', title: 'Brands & Manufacturers', desc: 'Distribute your products through our curated, admin-managed marketplace.' },
  { icon: '🚚', title: 'Logistics Partners', desc: 'Couriers and last-mile providers helping us deliver across Nigeria.' },
  { icon: '💳', title: 'Payment & Fintech', desc: 'Wallet, BNPL, and payment solutions for Nigerian shoppers.' },
  { icon: '📣', title: 'Affiliates & Influencers', desc: 'Promote Ecove products to your audience and earn commissions.' },
]

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white py-20 px-4 text-center">
        <p className="text-orange-400 text-sm font-extrabold uppercase tracking-widest mb-3">Partnerships</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Partner With Ecove</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          We're building Nigeria's most trusted curated marketplace and we're looking for partners who share that vision.
        </p>
      </section>

      {/* Opportunities */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Partnership Opportunities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {OPPORTUNITIES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-extrabold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry form */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Tell Us About Your Business</h2>
        <p className="text-sm text-gray-500 text-center mb-8 max-w-md mx-auto">
          Submit your details below — our team reviews every inquiry and will reach out if there's a fit. No account or storefront access is created from this form.
        </p>
        <PartnerInquiryForm />
      </section>

      <div className="text-center pb-10">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Homepage</Link>
      </div>
    </main>
  )
}
