'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Story image slides ─────────────────────────────────────────────────────────
const STORY_SLIDES = [
  {
    bg: 'linear-gradient(135deg,#3b1f0a 0%,#92460c 60%,#d97706 100%)',
    emoji: '🛍️',
    label: 'Artisan Craft',
    desc: 'Celebrating Nigerian craftsmanship',
  },
  {
    bg: 'linear-gradient(135deg,#0a1628 0%,#1e3a8a 60%,#3b82f6 100%)',
    emoji: '📱',
    label: 'Daily Essentials',
    desc: 'Tech & gadgets for modern living',
  },
  {
    bg: 'linear-gradient(135deg,#1a0533 0%,#4a1078 60%,#9333ea 100%)',
    emoji: '👗',
    label: 'Fashion & Style',
    desc: 'Trending looks from top vendors',
  },
]

// ── Image slider used in Our Story section ─────────────────────────────────────
function StorySlider() {
  const [idx, setIdx]           = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const t = setInterval(() => advance(1), 4500)
    return () => clearInterval(t)
  }, [])

  const advance = (dir: number) => {
    if (animating) return
    setAnimating(true)
    setIdx(i => (i + dir + STORY_SLIDES.length) % STORY_SLIDES.length)
    setTimeout(() => setAnimating(false), 400)
  }

  const s = STORY_SLIDES[idx]

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/3' }}>
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-400 ${animating ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: s.bg }}>
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />

        <span className="text-[5.5rem] sm:text-[7rem] drop-shadow-2xl leading-none select-none">{s.emoji}</span>
        <div className="mt-6 text-center">
          <span className="inline-block bg-black/30 backdrop-blur-sm text-white text-sm font-bold px-5 py-2 rounded-full">
            {s.label}
          </span>
          <p className="text-white/60 text-xs mt-2">{s.desc}</p>
        </div>
      </div>

      {/* Arrow buttons */}
      <button type="button" onClick={() => advance(-1)} aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 text-xl font-bold shadow-lg transition z-10">
        ‹
      </button>
      <button type="button" onClick={() => advance(1)} aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 text-xl font-bold shadow-lg transition z-10">
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {STORY_SLIDES.map((_, i) => (
          <button key={i} type="button" onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i === idx ? 22 : 8,
              height:     8,
              background: i === idx ? '#f68b1f' : 'rgba(255,255,255,0.45)',
            }} />
        ))}
      </div>
    </div>
  )
}

// ── Main page component ────────────────────────────────────────────────────────
export default function AboutClient() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-[#faf5ee] py-20 sm:py-28 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-orange-500 mb-5 bg-orange-50 px-4 py-1.5 rounded-full">
            About Ecove
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            We Make Luxury<br />
            <span className="text-orange-500">Accessible</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Ecove is your destination for premium electronics, high-end fashion, and expert artisan services —
            all curated to bring you the best of Nigeria and beyond at affordable prices.
          </p>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              Our Story: A Passion<br />for the Exquisite
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed text-base">
              <p>
                Ecove was born from a simple observation: Nigeria is overflowing with talented
                artisans, quality vendors, and incredible products that deserve a global-standard
                platform to shine on.
              </p>
              <p>
                We created Ecove to bridge that gap. Founded in 2020, we embarked on a mission to
                curate a collection of the nation's finest goods and make them available to you.
                We are more than just a marketplace — we are storytellers, connecting you to the
                artisans and cultures behind every product.
              </p>
              <p>
                From Ankara fashion to cutting-edge smartphones, from homegrown groceries to
                expert professional services, Ecove brings it all together so Nigerians can
                shop with confidence.
              </p>
            </div>
          </div>

          {/* Slider */}
          <StorySlider />
        </div>
      </section>

      {/* ── Mission & Values ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Our Mission &amp; Values</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-14 leading-relaxed">
            Our mission is to deliver an exceptional shopping experience built on a foundation of
            strong values. We are committed to quality, affordability, and your complete satisfaction.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '✅',
                title: 'Quality',
                desc: 'We handpick every vendor, ensuring they meet our rigorous standards for craftsmanship and excellence. Only the best makes it to Ecove.',
              },
              {
                icon: '💰',
                title: 'Affordability',
                desc: 'We believe great products shouldn\'t come with a hefty price tag. We work directly with sellers to bring you premium products at fair prices.',
              },
              {
                icon: '😊',
                title: 'Satisfaction',
                desc: 'Your happiness is our ultimate goal. From product discovery to delivery, we strive to exceed your expectations at every step.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow text-center group">
                <div className="w-16 h-16 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center text-3xl mx-auto mb-5">
                  {icon}
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Built on Integrity ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10">Built on Integrity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Full-width feature card */}
            <div className="sm:col-span-2 bg-gray-50 rounded-2xl p-7 sm:p-8 flex items-start gap-5 border border-gray-100 hover:border-orange-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl shrink-0 shadow-sm">🛡️</div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900 mb-2">Verified Sellers</h3>
                <p className="text-gray-500 leading-relaxed">
                  Every artisan and vendor on Ecove undergoes a rigorous vetting process to ensure
                  they meet our national standards for quality and professionalism.
                  Your trust is non-negotiable — we verify, so you can shop with confidence.
                </p>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="bg-amber-50 rounded-2xl p-6 flex items-start gap-4 border border-amber-100 hover:border-amber-300 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm">🚚</div>
              <div>
                <h3 className="font-extrabold text-gray-900 mb-1">Fast Delivery</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Same-day delivery across major cities including Lagos and Abuja. Nationwide coverage for all 36 states.
                </p>
              </div>
            </div>

            {/* Local Support */}
            <div className="bg-[#1a2744] rounded-2xl p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">🧑‍💻</div>
              <div>
                <h3 className="font-extrabold text-white mb-1">Local Support</h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  24/7 customer assistance tailored to the unique needs of our Nigerian community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission (dark) ────────────────────────────────────────────────── */}
      <section className="bg-[#0f1929] py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-400 mb-5 block">Our Mission</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Empowering Nigeria's<br />Local Economy
          </h2>
          <p className="text-gray-400 leading-relaxed text-lg max-w-2xl">
            By digitalising the marketplace experience, we provide local artisans with a
            global-standard platform to showcase their skills, while offering consumers a
            seamless, trustworthy way to shop for everything — from fresh groceries to luxury fashion.
          </p>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '184+',  label: 'Verified Vendors'  },
              { value: '36',    label: 'States Covered'    },
              { value: '200+',  label: 'Products Listed'   },
              { value: '100%',  label: 'Secure Checkout'   },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-orange-400 leading-none">{value}</p>
                <p className="text-sm text-gray-500 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get in Touch ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-10">Get in Touch</h2>
          <div className="space-y-3">
            {[
              { icon: '✉️', label: 'Email Us',        value: 'hello@ecove.com.ng',         href: 'mailto:hello@ecove.com.ng', badge: null },
              { icon: '📞', label: 'Call Support',    value: '+234 800 ECOVE (32683)',      href: 'tel:+2348003268300',        badge: null },
              { icon: '📍', label: 'Headquarters',    value: 'Asaba, Delta State, Nigeria', href: null,                        badge: 'MAP' },
            ].map(({ icon, label, value, href, badge }) => (
              <div key={label}
                className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-4">
                  <span className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-orange-50 transition-colors flex items-center justify-center text-xl shrink-0">
                    {icon}
                  </span>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
                    {href ? (
                      <Link href={href} className="font-bold text-gray-900 hover:text-orange-500 transition-colors">
                        {value}
                      </Link>
                    ) : (
                      <p className="font-bold text-gray-900">{value}</p>
                    )}
                  </div>
                </div>
                {badge ? (
                  <span className="text-xs font-extrabold text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg">
                    {badge}
                  </span>
                ) : (
                  <span className="text-gray-300 group-hover:text-orange-400 text-2xl transition-colors">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a2e] py-20 sm:py-28 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-5xl mb-6">🛍️</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready to Discover<br />Your Next Treasure?
          </h2>
          <p className="text-gray-400 mb-10 leading-relaxed">
            Explore our curated collections and experience a world of quality within reach.
          </p>
          <Link href="/search"
            className="inline-block bg-[#f68b1f] hover:bg-[#d4720e] text-white font-extrabold px-10 py-4 rounded-2xl transition-all shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5">
            Start Shopping Now
          </Link>
        </div>
      </section>

    </div>
  )
}
