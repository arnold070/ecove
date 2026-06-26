'use client'
import { useState } from 'react'
import Link from 'next/link'

const SUBJECTS = [
  'General Enquiry',
  'Order Issue',
  'Return / Refund Request',
  'Payment Problem',
  'Vendor / Seller Support',
  'Technical Issue',
  'Partnership Opportunity',
  'Other',
]

const QUICK_HELP = [
  {
    icon: '📦',
    title: 'Track My Order',
    desc: 'Check where your package is right now.',
    href: '/track',
    cta: 'Track Order →',
    bg: 'bg-blue-50',
    color: 'text-blue-600',
    border: 'border-blue-100 hover:border-blue-300',
  },
  {
    icon: '🔄',
    title: 'Returns & Refunds',
    desc: 'Initiate a return within 7 days of delivery.',
    href: '/returns',
    cta: 'Start Return →',
    bg: 'bg-purple-50',
    color: 'text-purple-600',
    border: 'border-purple-100 hover:border-purple-300',
  },
  {
    icon: '🏪',
    title: 'Start Selling',
    desc: 'Join 184+ vendors reaching thousands of customers.',
    href: '/vendor/register',
    cta: 'Become a Vendor →',
    bg: 'bg-orange-50',
    color: 'text-orange-600',
    border: 'border-orange-100 hover:border-orange-300',
  },
  {
    icon: '🔒',
    title: 'Payment Support',
    desc: 'Issues with Paystack, transfers, or card payments.',
    href: 'mailto:hello@ecove.com.ng?subject=Payment%20Support',
    cta: 'Get Help →',
    bg: 'bg-green-50',
    color: 'text-green-700',
    border: 'border-green-100 hover:border-green-300',
  },
]

export default function ContactClient() {
  const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent]   = useState(false)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject) { setError('Please select a subject.'); return }
    setError('')
    setBusy(true)
    await new Promise(r => setTimeout(r, 900))
    setSent(true)
    setBusy(false)
  }

  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf5ee] py-20 sm:py-28 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-orange-500 mb-5 bg-orange-50 px-4 py-1.5 rounded-full">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            We're Here<br />
            <span className="text-orange-500">to Help</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Have a question, issue, or idea? Reach out through any of our channels and our team
            will get back to you as quickly as possible.
          </p>
        </div>
      </section>

      {/* ── Contact channels ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Email */}
            <a href="mailto:hello@ecove.com.ng"
              className="group flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <span className="w-16 h-16 rounded-2xl bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center text-3xl mb-5">✉️</span>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1">Email Us</h3>
              <p className="text-sm text-gray-400 mb-3 leading-relaxed">We reply within 24 hours on business days.</p>
              <span className="text-orange-500 font-bold text-sm group-hover:underline">hello@ecove.com.ng</span>
            </a>

            {/* Phone */}
            <a href="tel:+2348003268300"
              className="group flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <span className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center text-3xl mb-5">📞</span>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1">Call Us</h3>
              <p className="text-sm text-gray-400 mb-3 leading-relaxed">Mon – Fri, 8am – 6pm WAT.</p>
              <span className="text-blue-600 font-bold text-sm group-hover:underline">+234 800 ECOVE (32683)</span>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/2348003268300" target="_blank" rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-8 rounded-2xl border-2 border-gray-100 hover:border-green-300 hover:shadow-lg transition-all duration-200">
              <span className="w-16 h-16 rounded-2xl bg-green-50 group-hover:bg-green-100 transition-colors flex items-center justify-center text-3xl mb-5">💬</span>
              <h3 className="font-extrabold text-gray-900 text-lg mb-1">WhatsApp</h3>
              <p className="text-sm text-gray-400 mb-3 leading-relaxed">Chat with us for the fastest response.</p>
              <span className="text-green-600 font-bold text-sm group-hover:underline">Message Us Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Office + Hours ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* HQ */}
            <div className="bg-[#1a2744] rounded-2xl p-7 sm:p-8 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">📍</div>
              <div>
                <h3 className="font-extrabold text-white text-lg mb-2">Our Headquarters</h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Ecove Marketplace Ltd<br />
                  14 Akin Adesola Street<br />
                  Victoria Island, Lagos<br />
                  Nigeria
                </p>
                <span className="inline-block mt-4 text-xs font-extrabold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-3 py-1.5 rounded-lg">
                  MAP COMING SOON
                </span>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-amber-50 rounded-2xl p-7 sm:p-8 border border-amber-100">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm">🕐</div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-900 text-lg mb-4">Support Hours</h3>
                  <div className="space-y-2.5 text-sm">
                    {[
                      ['Monday – Friday', '8:00am – 6:00pm WAT'],
                      ['Saturday',         '9:00am – 3:00pm WAT'],
                      ['Sunday',           'Closed'],
                    ].map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">{day}</span>
                        <span className={`font-bold ${hours === 'Closed' ? 'text-red-400' : 'text-gray-800'}`}>{hours}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-4 leading-relaxed">
                    🚀 WhatsApp is monitored outside these hours for urgent order issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Help ─────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Common Topics</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Find instant answers for the most frequent questions.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_HELP.map(({ icon, title, desc, href, cta, bg, color, border }) => (
              <Link key={title} href={href}
                className={`group flex flex-col p-6 rounded-2xl border-2 ${border} bg-white hover:shadow-md transition-all duration-200`}>
                <span className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center text-2xl mb-4`}>{icon}</span>
                <h3 className="font-extrabold text-gray-900 mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{desc}</p>
                <span className={`text-sm font-bold ${color}`}>{cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact form ───────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 sm:py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Send Us a Message</h2>
            <p className="text-gray-500">Fill in the form and we'll get back to you within 24 hours.</p>
          </div>

          {sent ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Message Received!</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Thanks, <strong>{form.name.split(' ')[0]}</strong>! We'll reply to{' '}
                <strong>{form.email}</strong> within 24 hours on business days.
              </p>
              <button type="button" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                className="text-sm font-semibold text-orange-500 hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    required
                    placeholder="e.g. Emeka Okafor"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-colors"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject *</label>
                <select
                  value={form.subject}
                  onChange={set('subject')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white text-gray-800"
                >
                  <option value="">Select a topic…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Message *</label>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  required
                  rows={5}
                  placeholder="Describe your issue or question in detail…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-colors resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm transition-colors disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Send Message →'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                By submitting you agree to our{' '}
                <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── Dark CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-[#0f1929] py-20 sm:py-28 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-5xl mb-6">🛍️</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            While You're Here,<br />Keep Shopping
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Thousands of verified products from trusted Nigerian vendors — delivered to your door.
          </p>
          <Link href="/search"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5">
            Browse All Products
          </Link>
        </div>
      </section>

    </div>
  )
}
