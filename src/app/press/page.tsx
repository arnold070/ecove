import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Press & Media – Ecove Marketplace',
  description: "Press resources, brand assets, and media contact for Ecove — Nigeria's multi-vendor marketplace.",
}

const FACTS = [
  { value: '36', label: 'States Covered' },
  { value: '2024', label: 'Founded' },
  { value: 'Asaba', label: 'Headquarters' },
  { value: 'Nigeria', label: 'Market' },
]

export default function PressPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white py-20 px-4 text-center">
        <p className="text-orange-400 text-sm font-extrabold uppercase tracking-widest mb-3">Press & Media</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Ecove in the News</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          Resources for journalists, bloggers, and media professionals covering Nigerian e-commerce.
        </p>
      </section>

      {/* Fast Facts */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xl font-extrabold text-gray-900 text-center mb-6">Fast Facts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FACTS.map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-2xl font-extrabold text-orange-500">{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Ecove */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 space-y-4 text-gray-700 leading-relaxed text-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">About Ecove</h2>
          <p>
            Ecove is a Nigerian multi-vendor marketplace connecting buyers with verified sellers across all 36 states.
            We offer a wide range of product categories including electronics, fashion, groceries, home & kitchen, and services.
          </p>
          <p>
            Founded in 2024 and headquartered in Asaba, Delta State, Ecove's mission is to make trusted online commerce
            accessible to every Nigerian — whether you're shopping in Lagos or Maiduguri.
          </p>
          <p>
            Payments are processed securely through Paystack and Flutterwave. Ecove does not hold buyer funds;
            payments are disbursed to verified vendors after successful order delivery.
          </p>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="max-w-3xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Brand Assets</h2>
          <p className="text-sm text-gray-500 mb-6">
            Need our logo or brand guidelines for editorial use? Email us and we'll send the press kit.
          </p>
          <a
            href="mailto:press@ecove.com.ng?subject=Press Kit Request"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Request Press Kit →
          </a>
        </div>
      </section>

      {/* Media Contact */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-8 text-center text-white">
          <p className="text-2xl mb-3">📰</p>
          <h2 className="text-xl font-extrabold mb-2">Media Contact</h2>
          <p className="text-white/70 text-sm mb-4">For press enquiries, interview requests, and media partnerships:</p>
          <a href="mailto:press@ecove.com.ng" className="text-orange-400 font-bold hover:underline">press@ecove.com.ng</a>
          <p className="text-white/50 text-xs mt-2">We typically respond within 1 business day.</p>
        </div>
      </section>

      <div className="text-center pb-10">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Homepage</Link>
      </div>
    </main>
  )
}
