import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog – Ecove Marketplace',
  description: 'Tips for buyers and sellers on the Ecove marketplace. Shopping guides, vendor advice, and Nigerian e-commerce insights.',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white py-20 px-4 text-center">
        <p className="text-orange-400 text-sm font-extrabold uppercase tracking-widest mb-3">Ecove Blog</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Tips, Guides & Insights</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          Shopping guides, seller advice, and the latest from Nigeria's e-commerce scene.
        </p>
      </section>

      {/* Coming Soon */}
      <section className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-6">✍️</p>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Coming Soon</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          We're working on articles to help you get the most out of Ecove — from finding the best deals
          to growing your vendor store. Check back soon.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-left">
          <p className="text-sm font-extrabold text-gray-700 mb-4">Topics we'll cover:</p>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              '🛍️  How to find genuine products on Ecove',
              "📦  A beginner's guide to selling on Ecove",
              '💳  Safe payment methods — what to know',
              '🚚  Understanding delivery timelines in Nigeria',
              '⭐  How reviews work and why they matter',
              '💰  How vendors get paid on Ecove',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors">
            Suggest a Topic
          </Link>
          <Link href="/search" className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-colors">
            Browse Products
          </Link>
        </div>
      </section>

      <div className="text-center pb-10">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Homepage</Link>
      </div>
    </main>
  )
}
