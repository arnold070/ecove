import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Partner With Us – Ecove Marketplace',
  description: 'Explore partnership opportunities with Ecove — logistics, payments, brands, and more.',
}

const OPPORTUNITIES = [
  {
    icon: '🚚',
    title: 'Logistics Partners',
    desc: 'Are you a courier, delivery company, or last-mile logistics provider in Nigeria? Partner with us to offer delivery services to our vendors.',
    contact: 'logistics@ecove.com.ng',
  },
  {
    icon: '💳',
    title: 'Payment & Fintech',
    desc: "We're open to integrating new payment methods that serve Nigerian consumers — wallet solutions, BNPL, and more.",
    contact: 'partnerships@ecove.com.ng',
  },
  {
    icon: '🏷️',
    title: 'Brand & Manufacturer Deals',
    desc: 'Are you a brand or manufacturer looking to distribute through Ecove? We can connect you with our verified vendor network.',
    contact: 'brands@ecove.com.ng',
  },
  {
    icon: '📣',
    title: 'Affiliate & Influencer',
    desc: 'Earn commissions by promoting Ecove products to your audience. Perfect for content creators and online communities.',
    contact: 'affiliates@ecove.com.ng',
  },
]

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white py-20 px-4 text-center">
        <p className="text-orange-400 text-sm font-extrabold uppercase tracking-widest mb-3">Partnerships</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Partner With Ecove</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          We're building Nigeria's most trusted marketplace and we're looking for partners who share that vision.
        </p>
      </section>

      {/* Opportunities */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Partnership Opportunities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {OPPORTUNITIES.map(({ icon, title, desc, contact }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="font-extrabold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
                <a
                  href={`mailto:${contact}?subject=${encodeURIComponent(title + ' Partnership')}`}
                  className="inline-flex items-center text-orange-500 text-sm font-bold hover:underline"
                >
                  {contact} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* General Enquiry */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-[#f68b1f] to-[#d4720e] rounded-2xl p-8 sm:p-10 text-center text-white">
          <p className="text-3xl mb-3">🤝</p>
          <h2 className="text-2xl font-extrabold mb-2">Not sure which fits?</h2>
          <p className="text-white/80 text-sm mb-6 max-w-sm mx-auto">
            Tell us about your business and what you have in mind — we'll find the right way to work together.
          </p>
          <a
            href="mailto:partnerships@ecove.com.ng?subject=Partnership Enquiry"
            className="inline-flex items-center px-7 py-3 bg-white text-orange-600 font-extrabold text-sm rounded-xl hover:bg-orange-50 transition-colors"
          >
            Get in Touch →
          </a>
        </div>
      </section>

      <div className="text-center pb-10">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Homepage</Link>
      </div>
    </main>
  )
}
