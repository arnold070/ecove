import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Careers – Ecove Marketplace',
  description: "Join the team building Nigeria's fastest-growing multi-vendor marketplace. View open roles at Ecove.",
}

const PERKS = [
  { icon: '🚀', title: 'High Impact', desc: 'Your work reaches millions of Nigerian shoppers and thousands of vendors.' },
  { icon: '🤝', title: 'Collaborative Culture', desc: 'Small, tight-knit team where every voice matters.' },
  { icon: '📍', title: 'Based in Asaba', desc: 'Headquartered in Delta State with remote-friendly roles.' },
  { icon: '📈', title: 'Grow Fast', desc: 'Learn fast in a startup environment with real ownership of your work.' },
]

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white py-20 px-4 text-center">
        <p className="text-orange-400 text-sm font-extrabold uppercase tracking-widest mb-3">We're Hiring</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Build the Future of<br />Nigerian Commerce</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          We're a small team with a big mission — making it easier for every Nigerian to buy and sell online.
          Come help us build it.
        </p>
      </section>

      {/* Perks */}
      <section className="max-w-4xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-8">Why Work at Ecove?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PERKS.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 items-start">
              <span className="text-3xl shrink-0">{icon}</span>
              <div>
                <p className="font-extrabold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Open Roles */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-4">Open Roles</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-lg font-bold text-gray-800 mb-2">No open roles right now</p>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            We don't have any active positions at the moment, but we're always interested in
            talented people. Send us your CV and we'll keep you in mind.
          </p>
          <a
            href="mailto:careers@ecove.com.ng?subject=Open Application"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Send an Open Application →
          </a>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white border-t border-gray-100 py-10 px-4 text-center">
        <p className="text-sm text-gray-500 mb-3">Questions about working here?</p>
        <a href="mailto:careers@ecove.com.ng" className="text-orange-500 font-bold hover:underline text-sm">
          careers@ecove.com.ng
        </a>
        <div className="mt-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Homepage</Link>
        </div>
      </section>
    </main>
  )
}
