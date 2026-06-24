'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'
import './homepage.css'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: string; name: string; slug: string; price: string; comparePrice?: string
  stock: number; isFlashSale: boolean; flashSalePrice?: string; flashSaleEnd?: string
  isFeatured: boolean; isBestSeller: boolean; brand?: string
  images: { url: string }[]
  category?: { name: string; slug: string }
  vendor: { businessName: string; slug: string; averageRating: string }
  _count: { reviews: number }
}
interface Category {
  id: string; name: string; slug: string; imageUrl?: string
  children?: { id: string; name: string; slug: string }[]
  _count?: { products: number }
}
interface Banner {
  id: string; title: string; subtitle?: string; ctaText?: string; ctaLink?: string
  imageUrl?: string; bgColor?: string; position: string; displayOrder: number
}

// ── Category meta ─────────────────────────────────────────────────────────────
const CAT_META: Record<string, { icon: string; color: string; light: string; lightClass: string }> = {
  'phones-tablets':             { icon: '📱', color: '#f68b1f', light: '#fff7ed', lightClass: 'bg-orange-50' },
  'computing':                  { icon: '💻', color: '#3b82f6', light: '#eff6ff', lightClass: 'bg-blue-50'   },
  'electronics':                { icon: '📺', color: '#8b5cf6', light: '#f5f3ff', lightClass: 'bg-violet-50' },
  'fashion':                    { icon: '👗', color: '#ec4899', light: '#fdf2f8', lightClass: 'bg-pink-50'   },
  'groceries':                  { icon: '🛒', color: '#15803d', light: '#f0fdf4', lightClass: 'bg-green-50'  },
  'services':                   { icon: '🛠️', color: '#10b981', light: '#ecfdf5', lightClass: 'bg-emerald-50'},
  'services-web-tech':          { icon: '💻', color: '#3b82f6', light: '#eff6ff', lightClass: 'bg-blue-50'   },
  'services-design':            { icon: '🎨', color: '#f59e0b', light: '#fffbeb', lightClass: 'bg-amber-50'  },
  'services-digital-marketing': { icon: '📊', color: '#06b6d4', light: '#ecfeff', lightClass: 'bg-cyan-50'   },
  'services-photography':       { icon: '📸', color: '#8b5cf6', light: '#f5f3ff', lightClass: 'bg-violet-50' },
  'services-home-repairs':      { icon: '🔧', color: '#ef4444', light: '#fef2f2', lightClass: 'bg-red-50'    },
  'services-tutoring':          { icon: '📚', color: '#10b981', light: '#ecfdf5', lightClass: 'bg-emerald-50'},
  'fashion-women':              { icon: '👩', color: '#ec4899', light: '#fdf2f8', lightClass: 'bg-pink-50'   },
  'fashion-men':                { icon: '👔', color: '#1d4ed8', light: '#eff6ff', lightClass: 'bg-blue-50'   },
  'fashion-kids':               { icon: '🧒', color: '#f59e0b', light: '#fffbeb', lightClass: 'bg-amber-50'  },
  'fashion-footwear':           { icon: '👟', color: '#6d28d9', light: '#f5f3ff', lightClass: 'bg-violet-50' },
  'fashion-accessories':        { icon: '👜', color: '#be185d', light: '#fdf2f8', lightClass: 'bg-pink-50'   },
  'fashion-traditional':        { icon: '🪡', color: '#b45309', light: '#fffbeb', lightClass: 'bg-amber-50'  },
}
const catIcon       = (slug: string) => CAT_META[slug]?.icon       || '🏷️'
const catColor      = (slug: string) => CAT_META[slug]?.color      || '#f68b1f'
const catLight      = (slug: string) => CAT_META[slug]?.light      || '#fff7ed'
const catLightClass = (slug: string) => CAT_META[slug]?.lightClass || 'bg-orange-50'

// ── Demo promo banners — colours live entirely in homepage.css via data-theme ──
const PROMO_BANNERS = [
  { theme: 'services',   src: '/banners/banner-services.png',    href: '/categories/services',        label: 'Affordable Services', sub: 'Quality you can trust.\nPrices you\'ll love.',  cta: 'Book Now',  emoji: '🛠️', emojiB: '💻', trust: ['Trusted Experts','Great Prices','Satisfaction\nGuaranteed','Fast Support'] },
  { theme: 'phones',     src: '/banners/banner-phones.png',      href: '/categories/phones-tablets',  label: 'Phones & Tablets',    sub: 'Stay connected.\nStay ahead.',                  cta: 'Shop Now',  emoji: '📱', emojiB: '📲', trust: ['Latest Tech','Secure Payment','Wide Compat.','Fast Delivery'] },
  { theme: 'computing',  src: '/banners/banner-computing.png',   href: '/categories/computing',       label: 'Computing Deals',     sub: 'Top performance.\nGreat prices.',               cta: 'Shop Now',  emoji: '💻', emojiB: '🖨️', trust: ['Top Brands','Great Prices','Fast Delivery','Easy Returns'] },
  { theme: 'fashion',    src: '/banners/banner-fashion.png',     href: '/categories/fashion',         label: 'Fashion Deals',       sub: 'Style you love.\nPrices you\'ll love.',          cta: 'Shop Now',  emoji: '👜', emojiB: '👟', trust: ['Top Brands','Great Prices','Warranty\nAssured','Fast Delivery'] },
  { theme: 'sneakers',   src: '/banners/banner-sneakers.png',    href: '/categories/fashion-footwear',label: 'Sneaker Deals',       sub: 'Fresh styles.\nGreat prices.',                  cta: 'Shop Now',  emoji: '👟', emojiB: '🧢', trust: ['Top Brands','Great Prices','Fast Delivery','Easy Returns'] },
  { theme: 'mobile',     src: '/banners/banner-mobile.png',      href: '/categories/phones-tablets',  label: 'Mobile Accessories',  sub: 'Power up your day.\nStay connected.',           cta: 'Shop Now',  emoji: '🎧', emojiB: '🔋', trust: ['Top Brands','Great Prices','Fast Delivery','Easy Returns'] },
  { theme: 'arrival',    src: '/banners/banner-new-arrival.png', href: '/search?sort=newest',         label: 'New Arrivals',        sub: 'Fresh picks.\nBetter everyday.',                cta: 'Shop Now',  emoji: '🎒', emojiB: '⌚', trust: ['Stylish Picks','Smart Tech','Latest Trends','Premium Quality'] },
]

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, href, label }: { title: string; sub?: string; href?: string; label?: string }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-7 rounded-full shrink-0" style={{ background: '#f68b1f' }} />
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{title}</h2>
          {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all" style={{ color: '#f68b1f' }}>
          {label || 'See all'} <span>→</span>
        </Link>
      )}
    </div>
  )
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ p, size = 'md' }: { p: Product; size?: 'sm' | 'md' }) {
  const { addItem } = useCart()
  const price    = parseFloat(p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price)
  const compare  = p.comparePrice ? parseFloat(p.comparePrice) : null
  const discount = compare && compare > price ? Math.round((1 - price / compare) * 100) : null
  const imgUrl   = p.images?.[0]?.url
  const rating   = parseFloat(p.vendor.averageRating || '4.5')
  const stars    = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))

  const add = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({ id: p.id, name: p.name, price, image: imgUrl || '', slug: p.slug })
    toast.success(`${p.name.substring(0, 20)}… added!`)
  }

  return (
    <Link href={`/products/${p.slug}`} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '4/3' }}>
        {imgUrl
          ? <Image src={imgUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-400" sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,220px" />
          : <div className="absolute inset-0 flex items-center justify-center text-5xl">{catIcon(p.category?.slug || '')}</div>}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full leading-tight">
              -{discount}%
            </span>
          )}
          {p.isBestSeller && (
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full leading-tight text-white" style={{ background: '#d4720e' }}>
              🏆 Top Seller
            </span>
          )}
          {p.isFlashSale && (
            <span className="bg-orange-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full leading-tight animate-pulse">
              ⚡ Sale
            </span>
          )}
        </div>

        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Quick add overlay */}
        {p.stock > 0 && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <button onClick={add}
              className="text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg transition-transform hover:scale-105"
              style={{ background: '#f68b1f' }}>
              + Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {p.category && (
          <span className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: catColor(p.category.slug) }}>
            {p.category.name}
          </span>
        )}
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 flex-1">{p.name}</p>

        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-base font-extrabold" style={{ color: '#f68b1f' }}>₦{price.toLocaleString()}</span>
          {compare && <span className="text-xs text-gray-400 line-through">₦{compare.toLocaleString()}</span>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xs tracking-tighter">{stars}</span>
            <span className="text-[10px] text-gray-400">({p._count.reviews})</span>
          </div>
          {p.stock > 0 && p.stock <= 10 && (
            <span className="text-[10px] text-red-500 font-semibold">Only {p.stock} left</span>
          )}
        </div>

        <p className="text-[10px] text-gray-400 mt-1 truncate">by {p.vendor.businessName}</p>
      </div>
    </Link>
  )
}

// ── Flash Countdown ────────────────────────────────────────────────────────────
function FlashCountdown({ end }: { end: string }) {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(end).getTime() - Date.now()
      if (diff <= 0) return
      setT({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) })
    }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id)
  }, [end])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flex items-center gap-1 text-sm font-extrabold">
      {[t.h, t.m, t.s].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-white/20 backdrop-blur-sm rounded-lg w-9 h-9 flex items-center justify-center text-base">{pad(v)}</span>
          {i < 2 && <span className="opacity-60 text-xs">:</span>}
        </span>
      ))}
    </div>
  )
}

// ── Hero Slider ────────────────────────────────────────────────────────────────
interface Slide {
  title: string; accent?: string; subtitle?: string; badge?: string
  ctaText?: string; ctaLink?: string; bg: string; textColor: string
  imageUrl?: string; emoji: string; emojiSmall?: string; tag?: string
}

const HERO_SLIDES: Slide[] = [
  {
    badge: '🔥 Best Deals · Limited Time',
    title: 'Latest Smartphones', accent: 'in Nigeria',
    subtitle: 'Sealed, warranted & delivered to your door nationwide.',
    ctaText: 'Shop Phones', ctaLink: '/categories/phones-tablets',
    bg: 'linear-gradient(135deg,#0f1a3a 0%,#1a3266 60%,#2563eb 100%)',
    textColor: '#ffffff', emoji: '📱', emojiSmall: '📲', tag: 'phones',
  },
  {
    badge: '⚡ Flash Sale',
    title: 'Up to 60% Off', accent: 'Today Only',
    subtitle: 'Limited stock on electronics, fashion & more. Grab it now.',
    ctaText: 'Grab Deals', ctaLink: '/search?flashSale=true',
    bg: 'linear-gradient(135deg,#7f0000 0%,#c0392b 60%,#f68b1f 100%)',
    textColor: '#ffffff', emoji: '🛍️', emojiSmall: '🏷️', tag: 'sale',
  },
  {
    badge: '🌟 New Collection',
    title: 'Fashion for', accent: 'Every Style',
    subtitle: 'Ankara prints, office wear, footwear & accessories — all in one place.',
    ctaText: 'Shop Fashion', ctaLink: '/categories/fashion',
    bg: 'linear-gradient(135deg,#1a0533 0%,#4a1078 60%,#9333ea 100%)',
    textColor: '#ffffff', emoji: '👗', emojiSmall: '👜', tag: 'fashion',
  },
  {
    badge: '✅ Verified Pros',
    title: 'Hire Skilled', accent: 'Professionals',
    subtitle: 'Web design, photography, home repairs, tutoring & more.',
    ctaText: 'Browse Services', ctaLink: '/categories/services',
    bg: 'linear-gradient(135deg,#022c1e 0%,#065f46 60%,#10b981 100%)',
    textColor: '#ffffff', emoji: '🛠️', emojiSmall: '💼', tag: 'services',
  },
  {
    badge: '💻 Top Picks',
    title: 'Computing Deals', accent: 'Great Prices',
    subtitle: 'Laptops, desktops, printers & accessories for work and play.',
    ctaText: 'Shop Computing', ctaLink: '/categories/computing',
    bg: 'linear-gradient(135deg,#1c1400 0%,#78450a 60%,#d97706 100%)',
    textColor: '#ffffff', emoji: '💻', emojiSmall: '🖥️', tag: 'computing',
  },
]

function HeroSlider({ slides }: { slides: Slide[] }) {
  const [idx,      setIdx]      = useState(0)
  const [prev,     setPrev]     = useState<number | null>(null)
  const [dir,      setDir]      = useState<'left' | 'right'>('right')
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = (i: number, direction?: 'left' | 'right') => {
    if (animating || i === idx) return
    setDir(direction || (i > idx ? 'right' : 'left'))
    setPrev(idx)
    setIdx(i)
    setAnimating(true)
    setTimeout(() => { setPrev(null); setAnimating(false) }, 480)
    resetTimer()
  }
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIdx(s => {
        const next = (s + 1) % slides.length
        setPrev(s); setDir('right'); setAnimating(true)
        setTimeout(() => { setPrev(null); setAnimating(false) }, 480)
        return next
      })
    }, 5000)
  }
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [slides.length])

  const s = slides[idx]

  return (
    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-xl" style={{ height: '360px' }}>

      {/* Slides */}
      {slides.map((slide, i) => {
        const isCurrent = i === idx
        const isPrev    = i === prev
        if (!isCurrent && !isPrev) return null
        const enterClass = isCurrent
          ? (dir === 'right' ? 'translate-x-full' : '-translate-x-full')
          : '0'
        const exitClass  = isPrev
          ? (dir === 'right' ? '-translate-x-full' : 'translate-x-full')
          : '0'
        return (
          <div key={i}
            className={`absolute inset-0 transition-transform duration-[480ms] ease-in-out ${isCurrent ? 'z-10' : 'z-0'}`}
            style={{
              background: slide.imageUrl ? '#111' : slide.bg,
              transform: isCurrent
                ? (animating ? `translateX(${enterClass})` : 'translateX(0)')
                : (isPrev && animating ? `translateX(${exitClass})` : 'translateX(0)'),
            }}>

            {slide.imageUrl && (
              <>
                <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" sizes="800px" priority={i === 0} />
                {/* gradient overlay so white text stays readable over any photo */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />
              </>
            )}

            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 bg-white" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full opacity-10 bg-white" />

            <div className="absolute inset-0 flex items-center px-8 lg:px-10">
              {/* Text side */}
              <div className="flex-1 max-w-xs lg:max-w-sm">
                {slide.badge && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4 border"
                    style={{ background: 'rgba(255,255,255,0.15)', color: slide.textColor, borderColor: 'rgba(255,255,255,0.3)' }}>
                    {slide.badge}
                  </span>
                )}
                <h2 className="font-extrabold leading-tight mb-1" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: slide.textColor }}>
                  {slide.title}
                </h2>
                <h2 className="font-extrabold leading-tight mb-3" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', color: 'rgba(255,255,255,0.65)' }}>
                  {slide.accent}
                </h2>
                {slide.subtitle && (
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {slide.subtitle}
                  </p>
                )}
                {slide.ctaLink && (
                  <Link href={slide.ctaLink}
                    className="inline-flex items-center gap-2 font-extrabold text-sm px-7 py-3 rounded-xl shadow-2xl hover:scale-105 transition-transform"
                    style={{ background: '#fff', color: '#1a1a1a' }}>
                    {slide.ctaText || 'Shop Now'}
                    <span className="text-base">→</span>
                  </Link>
                )}
              </div>

              {/* Emoji illustration */}
              <div className="hidden sm:flex flex-col items-center justify-center flex-1 select-none">
                <span className="drop-shadow-2xl leading-none" style={{ fontSize: 'clamp(5rem,10vw,7rem)' }}>{slide.emoji}</span>
                {slide.emojiSmall && (
                  <span className="drop-shadow-xl leading-none mt-3 opacity-60" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>{slide.emojiSmall}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Dots + progress */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width:   i === idx ? 24 : 8,
              height:  8,
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.35)',
            }} />
        ))}
      </div>

      {/* Arrow buttons */}
      <button onClick={() => goTo((idx - 1 + slides.length) % slides.length, 'left')} aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-110 z-20"
        style={{ background: 'rgba(0,0,0,0.25)' }}>‹</button>
      <button onClick={() => goTo((idx + 1) % slides.length, 'right')} aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-110 z-20"
        style={{ background: 'rgba(0,0,0,0.25)' }}>›</button>
    </div>
  )
}

// ── Promo Banner Card ─────────────────────────────────────────────────────────
// Uses CSS demo as the always-visible base layer.
// The real image fades in on top once it loads; if it 404s the CSS shows through.
function PromoBannerCard({ b, priority }: { b: typeof PROMO_BANNERS[0]; priority: boolean }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const showImage = loaded && !failed

  return (
    <Link
      href={b.href}
      data-theme={b.theme}
      className="pb-card group relative rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-250 flex flex-col"
    >
      {/* ── CSS demo layer — always present, sits beneath the image ── */}
      <div className="pb-demo-bg absolute inset-0 flex flex-col">
        {/* Best Deals tag */}
        <div className="flex justify-end p-2">
          <div className="pb-accent-tag rounded-md text-white text-center px-1.5 py-0.5 shadow-md">
            <p className="text-[9px] font-extrabold leading-none tracking-wide">BEST</p>
            <p className="text-[9px] font-extrabold leading-none tracking-wide">DEALS</p>
            <div className="pb-limited-tag mt-0.5 rounded text-[7px] font-bold px-0.5 text-white">
              LIMITED
            </div>
          </div>
        </div>

        {/* Emoji */}
        <div className="flex-1 flex items-center justify-center select-none">
          <span className="pb-emoji-lg drop-shadow-lg leading-none group-hover:scale-110 transition-transform duration-300">{b.emoji}</span>
        </div>

        {/* Label + CTA */}
        <div className="p-2 pt-0">
          <p className="pb-text font-extrabold text-xs leading-tight">{b.label}</p>
          <div className="pb-cta-btn mt-1.5 inline-flex items-center rounded-md border text-[10px] font-bold px-2 py-1">
            {b.cta} →
          </div>
        </div>
      </div>

      {/* ── Real image — object-contain so the full image is visible ── */}
      <div className={`pb-img-layer absolute inset-0${showImage ? ' is-loaded' : ''}`}>
        <Image
          src={b.src}
          alt={b.label}
          fill
          sizes="(max-width:1024px) 25vw, 14vw"
          quality={85}
          priority={priority}
          className="object-contain rounded-2xl"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </div>

      {/* ── Hover chip — CSS-only overlay, no JS mouse handlers ── */}
      <div className="pb-hover-overlay absolute inset-0 rounded-2xl z-20 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
          Shop Now →
        </span>
      </div>
    </Link>
  )
}

// ── Service Category Card ──────────────────────────────────────────────────────
function ServiceCard({ cat }: { cat: Category }) {
  return (
    <Link href={`/categories/${cat.slug}`}
      className="group flex flex-col items-center p-5 rounded-2xl border-2 border-transparent hover:border-current transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-center"
      style={{ background: catLight(cat.slug), color: catColor(cat.slug) }}>
      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{catIcon(cat.slug)}</span>
      <span className="text-sm font-bold leading-tight">{cat.name}</span>
      {cat._count && <span className="text-[10px] mt-1 opacity-70">{cat._count.products} services</span>}
    </Link>
  )
}

// ── Testimonial ────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Chiamaka O.', city: 'Lagos', text: 'Ordered an iPhone from TechVault and it arrived in 2 days, sealed and genuine. Best shopping experience in Nigeria!', rating: 5, initials: 'CO' },
  { name: 'Emeka B.', city: 'Abuja', text: 'Hired ProServices Hub for my website redesign. Delivered in 10 days, looks amazing and fully mobile responsive. Worth every kobo.', rating: 5, initials: 'EB' },
  { name: 'Fatima Y.', city: 'Kano', text: 'StyleZone NG is amazing! Got my Ankara matching set for a wedding and the quality was top notch. Will definitely order again.', rating: 5, initials: 'FY' },
]

// ── Main Homepage Component ────────────────────────────────────────────────────
export default function HomepageClient({
  featured, categories, flashSale, bestSellers, newest, fashion, banners, vendorCount = 184, productCount = 200, groceries = [],
}: {
  featured: Product[]; categories: Category[]; flashSale: Product[]
  bestSellers: Product[]; newest: Product[]; fashion: Product[]
  banners: Banner[]; vendorCount?: number; productCount?: number
  groceries?: Product[]
}) {
  // Top-level categories (no parent — all seeded cats are top-level)
  const topCats    = categories
  const fashionCat = categories.find(c => c.slug === 'fashion')
  const servicesCat = categories.find(c => c.slug === 'services')
  const fashionSubcats: Category[] = fashionCat?.children || []
  const servicesSubcats: Category[] = servicesCat?.children || []

  const sideLeft         = banners.find(b => b.position === 'side_card_left')
  const sideRight        = banners.find(b => b.position === 'side_card_right')
  const fullWidthBanners = banners.filter(b => b.position === 'full_width')
  const dualBanners      = banners.filter(b => b.position === 'dual_banner')

  // Use db hero banners when available; fall back to hardcoded slides
  const heroDbBanners = banners.filter(b => b.position === 'hero_slider')
  const heroSlides: Slide[] = heroDbBanners.length > 0
    ? heroDbBanners.map(b => ({
        badge:     b.subtitle || '',
        title:     b.title,
        accent:    '',
        subtitle:  '',
        ctaText:   b.ctaText || 'Shop Now',
        ctaLink:   b.ctaLink || '/search',
        bg:        b.bgColor || 'linear-gradient(135deg,#0f1a3a,#2563eb)',
        textColor: '#ffffff',
        imageUrl:  b.imageUrl,
        emoji:     '🛍️',
      }))
    : HERO_SLIDES

  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── Hero Block ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">

          {/* Category sidebar */}
          <aside className="hidden lg:flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm" style={{ minHeight: '360px' }}>
            <div className="px-4 py-3 text-white text-sm font-bold flex items-center gap-2" style={{ background: '#f68b1f' }}>
              <span>☰</span> All Categories
            </div>
            {categories.map(cat => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}
                className="group flex items-center gap-3 px-4 py-2.5 text-sm border-b border-gray-50 last:border-0 hover:bg-orange-50 transition-colors flex-1">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition-transform ${catLightClass(cat.slug)}`}>
                  {catIcon(cat.slug)}
                </span>
                <span className="flex-1 font-semibold text-gray-700 group-hover:text-orange-700">{cat.name}</span>
                <span className="text-gray-300 text-xs group-hover:text-orange-400 transition-colors">›</span>
              </Link>
            ))}
          </aside>

          {/* Hero Slider — db banners take priority over hardcoded slides */}
          <HeroSlider slides={heroSlides} />

          {/* Right promo stack — db side_card banners override hardcoded design */}
          <div className="hidden lg:flex flex-col gap-3" style={{ minHeight: '360px' }}>
            {[
              sideLeft  || { title: 'Flash Sale',      subtitle: 'Up to 60% off',           ctaText: 'Grab Deals →', ctaLink: '/search?flashSale=true',   bgColor: 'linear-gradient(135deg,#7f0000,#dc2626)', imageUrl: null, emoji: '⚡' },
              sideRight || { title: 'Best Sellers',    subtitle: 'Most loved products',      ctaText: 'Shop Now →',   ctaLink: '/search?bestSeller=true',   bgColor: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', imageUrl: null, emoji: '🏆' },
              {             title: 'Fresh Groceries',  subtitle: 'Delivered to your door',   ctaText: 'Order Now →',  ctaLink: '/categories/groceries',     bgColor: 'linear-gradient(135deg,#78350f,#d97706)', imageUrl: null, emoji: '🛒' },
            ].map((card: any) => (
              <Link key={card.title} href={card.ctaLink}
                className="flex-1 rounded-2xl p-5 text-white flex flex-col justify-between overflow-hidden relative hover:scale-[1.02] transition-transform shadow-sm"
                style={{ background: card.imageUrl ? '#111' : card.bgColor }}>
                {card.imageUrl && (
                  <>
                    <Image src={card.imageUrl} alt={card.title} fill className="object-cover" sizes="200px" />
                    <div className="absolute inset-0 bg-black/50" />
                  </>
                )}
                <div className="relative z-10">
                  <span className="text-2xl">{card.emoji}</span>
                  <p className="font-extrabold text-base mt-1 leading-tight">{card.title}</p>
                  <p className="text-xs opacity-75 mt-0.5">{card.subtitle}</p>
                </div>
                <span className="relative z-10 text-xs font-bold opacity-90 bg-white/15 rounded-lg px-3 py-1.5 self-start mt-2">{card.ctaText}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile Category Bar (hidden on lg where sidebar shows) ─────────── */}
      <div className="lg:hidden bg-white border-b border-gray-100">
        <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide">
          {categories.map(cat => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}
              className="flex flex-col items-center gap-1.5 shrink-0 w-16 group">
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${catLightClass(cat.slug)}`}>
                {catIcon(cat.slug)}
              </span>
              <span className="text-[10px] font-semibold text-gray-600 text-center leading-tight line-clamp-2">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trust Strip ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-gray-100 my-4">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚚', bg: 'bg-orange-50', title: 'Free Delivery',    sub: 'Orders over ₦20,000' },
              { icon: '🔒', bg: 'bg-blue-50',   title: 'Secure Payment',   sub: 'Paystack & Flutterwave' },
              { icon: '✅', bg: 'bg-green-50',  title: 'Verified Sellers', sub: 'All vendors screened' },
              { icon: '↩️', bg: 'bg-purple-50', title: 'Easy Returns',     sub: '7-day return policy' },
            ].map(({ icon, bg, title, sub }) => (
              <div key={title} className="flex items-center gap-3 py-1">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${bg}`}>{icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Admin Campaign Banners (full_width + dual_banner positions) ─────── */}
      {(fullWidthBanners.length > 0 || dualBanners.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          {/* Full-width banners */}
          {fullWidthBanners.map(b => (
            <Link key={b.id} href={b.ctaLink || '/search'}
              className="relative flex items-center h-36 sm:h-44 rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform shadow-sm block">
              {b.imageUrl
                ? <>
                    <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="100vw" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
                  </>
                : <div className="absolute inset-0 campaign-banner-bg" style={{ '--campaign-bg': b.bgColor || '#f68b1f' } as React.CSSProperties} />
              }
              <div className="relative z-10 px-8 py-6 text-white">
                <p className="text-2xl font-extrabold leading-tight">{b.title}</p>
                {b.subtitle && <p className="text-sm opacity-80 mt-1">{b.subtitle}</p>}
                {b.ctaText  && <span className="mt-3 inline-block text-xs font-extrabold bg-white text-gray-900 px-4 py-1.5 rounded-lg">{b.ctaText} →</span>}
              </div>
            </Link>
          ))}

          {/* Dual banners — side by side */}
          {dualBanners.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dualBanners.slice(0, 2).map(b => (
                <Link key={b.id} href={b.ctaLink || '/search'}
                  className="relative flex items-center h-36 rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform shadow-sm block">
                  {b.imageUrl
                    ? <>
                        <Image src={b.imageUrl} alt={b.title} fill className="object-cover" sizes="50vw" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
                      </>
                    : <div className="absolute inset-0 campaign-banner-bg" style={{ '--campaign-bg': b.bgColor || '#f68b1f' } as React.CSSProperties} />
                  }
                  <div className="relative z-10 px-6 py-4 text-white">
                    <p className="text-lg font-extrabold leading-tight">{b.title}</p>
                    {b.subtitle && <p className="text-xs opacity-75 mt-1">{b.subtitle}</p>}
                    {b.ctaText  && <span className="mt-2 inline-block text-[11px] font-extrabold bg-white text-gray-900 px-3 py-1 rounded-lg">{b.ctaText} →</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Flash Sale ───────────────────────────────────────────────────────── */}
      {flashSale.length > 0 && (
        <section className="py-8" style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#1a0a00 50%,#2d1000 100%)' }}>
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/40">⚡</div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">Flash Sale</h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white uppercase tracking-wide">Live</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">Ends in</p>
                    {flashSale[0]?.flashSaleEnd && <FlashCountdown end={flashSale[0].flashSaleEnd} />}
                  </div>
                </div>
              </div>
              <Link href="/search?flashSale=true"
                className="self-start sm:self-auto text-sm font-bold px-5 py-2.5 rounded-xl border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition-all">
                See All Deals →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {flashSale.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Promo Banners — horizontal scroll row (Jumia-style) ────────────── */}
      <section className="py-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <SectionHeader title="Deals &amp; Promotions" sub="Tap any banner to explore" />
        </div>

        <div className="relative">
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10" style={{ background: 'linear-gradient(to right,white,transparent)' }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10" style={{ background: 'linear-gradient(to left,white,transparent)' }} />

          <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 max-w-7xl mx-auto px-4">
            {PROMO_BANNERS.map((b, i) => (
              <PromoBannerCard key={b.theme} b={b} priority={i < 5} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo Banner Strip ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { bg: 'linear-gradient(135deg,#c0392b,#e74c3c)', icon: '📱', title: 'New Phones Arrived', sub: 'iPhones, Samsung & more', href: '/categories/phones-tablets', cta: 'Shop now →' },
            { bg: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', icon: '💻', title: 'Work From Anywhere', sub: 'Laptops for every budget', href: '/categories/computing', cta: 'Shop now →' },
            { bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', icon: '👗', title: 'Fashion Week Picks', sub: 'Trending styles for you', href: '/categories/fashion', cta: 'Shop now →' },
            { bg: 'linear-gradient(135deg,#064e3b,#059669)', icon: '🛠️', title: 'Hire a Professional', sub: 'Repairs, design & more', href: '/categories/services', cta: 'Book now →' },
            { bg: 'linear-gradient(135deg,#78350f,#d97706)', icon: '🛒', title: 'Fresh Groceries', sub: 'Delivered to your door', href: '/categories/groceries', cta: 'Shop now →' },
          ].map(({ bg, icon, title, sub, href, cta }) => (
            <Link key={href} href={href}
              className="flex items-center gap-4 p-5 rounded-2xl text-white hover:scale-[1.02] transition-transform shadow-sm"
              style={{ background: bg }}>
              <span className="text-4xl">{icon}</span>
              <div>
                <p className="font-extrabold text-base">{title}</p>
                <p className="text-sm opacity-75">{sub}</p>
                <p className="text-xs font-semibold mt-1 opacity-90">{cta}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Featured Products ────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="Featured Products" sub="Handpicked by our team" href="/search?featured=true" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featured.slice(0, 12).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Best Sellers ─────────────────────────────────────────────────────── */}
      {bestSellers.length > 0 && (
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="Best Sellers" sub="Most loved by our customers" href="/search?bestSeller=true" label="View all" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {bestSellers.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Fresh Groceries ──────────────────────────────────────────────────── */}
      {groceries.length > 0 && (
        <section className="py-10 bg-amber-50 border-y border-amber-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-7 rounded-full shrink-0 bg-amber-500" />
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Fresh Groceries</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Rice, oil, noodles & pantry staples delivered nationwide</p>
                </div>
              </div>
              <Link href="/categories/groceries" className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                Shop Groceries →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {groceries.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
            <div className="mt-6 bg-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-amber-100">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🚚</span>
                <div>
                  <p className="font-extrabold text-gray-900">Same-Day Delivery Available</p>
                  <p className="text-sm text-gray-500">Lagos and Abuja orders placed before 2pm delivered today</p>
                </div>
              </div>
              <Link href="/categories/groceries"
                className="shrink-0 px-7 py-3 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity bg-amber-500">
                Order Now →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Fashion Collection ───────────────────────────────────────────────── */}
      {fashion.length > 0 && (
        <section className="py-10 bg-pink-50 border-y border-pink-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-7 rounded-full shrink-0 bg-pink-500" />
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Fashion Collection</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Ankara, office wear, footwear & accessories</p>
                </div>
              </div>
              <Link href="/categories/fashion" className="text-sm font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1">
                All Fashion →
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Sub-category links */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 flex flex-col gap-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Browse by type</p>
                {fashionSubcats.map(cat => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-pink-50 transition-colors group">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${catLightClass(cat.slug)}`}>{catIcon(cat.slug)}</span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-700">{cat.name}</span>
                    <span className="ml-auto text-gray-300 text-xs group-hover:text-pink-400">→</span>
                  </Link>
                ))}
                <Link href="/categories/fashion"
                  className="mt-2 block text-center py-2.5 rounded-xl text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 transition-colors">
                  See All Fashion
                </Link>
              </div>

              {/* Fashion products grid */}
              <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {fashion.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────────────────────────── */}
      {newest.length > 0 && (
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader title="New Arrivals" sub="Just landed on Ecove" href="/search?sort=newest" label="See all new" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {newest.slice(0, 6).map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Verified Vendors ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader title="Meet Our Verified Vendors" sub="Screened sellers with great reviews" href="/vendors" label="All vendors" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { name: 'TechVault NG',    desc: 'Phones, laptops & electronics',       icon: '💻', href: '/vendors/techvault-ng',    iconBg: 'bg-blue-50',    cta: 'text-blue-500'    },
            { name: 'StyleZone NG',    desc: 'Fashion, Ankara & footwear',           icon: '👗', href: '/vendors/stylezone-ng',    iconBg: 'bg-pink-50',    cta: 'text-pink-500'    },
            { name: 'ProServices Hub', desc: 'Web, design, repairs & groceries',     icon: '🛠️', href: '/vendors/proservices-hub', iconBg: 'bg-emerald-50', cta: 'text-emerald-600' },
          ] as const).map(v => (
            <Link key={v.name} href={v.href}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <span className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${v.iconBg}`}>
                {v.icon}
              </span>
              <div>
                <p className="font-extrabold text-gray-900">{v.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{v.desc}</p>
                <p className={`text-xs font-semibold mt-2 ${v.cta}`}>Browse store →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────────────────── */}
      <div className="py-10 bg-gradient-to-br from-[#f68b1f] to-[#d4720e]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-white/80 text-sm font-semibold uppercase tracking-widest mb-6">Why Nigerians Trust Ecove</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: `${productCount}+`, label: 'Products Listed' },
              { value: `${vendorCount}+`, label: 'Verified Vendors' },
              { value: '36', label: 'States Covered' },
              { value: '100%', label: 'Secure Checkout' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-4xl font-extrabold tracking-tight">{value}</span>
                <span className="text-sm text-white/75 mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <SectionHeader title="What Our Customers Say" sub="Real reviews from real Nigerians" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, city, text, rating, initials }) => (
            <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-yellow-400 text-lg mb-3">{'★'.repeat(rating)}</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-[#f68b1f]">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">📍 {city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-2xl p-8 text-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
          <p className="text-3xl mb-2">📬</p>
          <h3 className="text-xl font-extrabold text-white mb-1">Get the Best Deals First</h3>
          <p className="text-sm text-gray-400 mb-6">Subscribe for flash sale alerts, new arrivals and exclusive discounts</p>
          {subscribed ? (
            <p className="text-green-400 font-semibold">✅ You're subscribed! Watch your inbox.</p>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true) }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/10 text-white placeholder-gray-500 border border-white/10 outline-none focus:border-orange-400 transition-colors" />
              <button type="submit"
                className="px-6 py-3 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity shrink-0 bg-[#f68b1f]">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Vendor CTA ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f68b1f] via-[#d4720e] to-[#b85c09]" />
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-white/10 rounded-full" />
          <div className="relative p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-white text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-extrabold mb-2">Start Selling on Ecove Today</h3>
              <p className="text-sm lg:text-base opacity-90 mb-1">Join {vendorCount}+ active vendors reaching thousands of customers</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-3 text-sm">
                {['✅ Free to start', '📦 We handle logistics', '💰 Weekly payouts', '📊 Sales dashboard'].map(f => (
                  <span key={f} className="opacity-90">{f}</span>
                ))}
              </div>
            </div>
            <Link href="/vendor/register"
              className="shrink-0 bg-white font-extrabold px-10 py-4 rounded-2xl text-sm hover:scale-105 transition-transform shadow-xl"
              style={{ color: '#d4720e' }}>
              Become a Vendor →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
