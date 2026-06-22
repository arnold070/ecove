'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart, useWishlist } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/apiClient'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </span>
  )
}

function ReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth()
  const [rating,    setRating]    = useState(0)
  const [hover,     setHover]     = useState(0)
  const [title,     setTitle]     = useState('')
  const [body,      setBody]      = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = useMutation({
    mutationFn: () => api.post('/reviews', { productId, rating, title, body }),
    onSuccess: () => { setSubmitted(true); toast.success('Review submitted! It will appear after moderation.') },
  })

  if (!user) return (
    <div className="mt-6 p-5 rounded-xl bg-orange-50 border border-orange-100 text-center">
      <p className="text-sm text-gray-700 font-medium">
        <Link href="/login" className="text-orange-500 font-bold hover:underline">Sign in</Link> to write a review
      </p>
    </div>
  )

  if (submitted) return (
    <div className="mt-6 p-5 rounded-xl bg-green-50 border border-green-100 text-center">
      <p className="text-2xl mb-2">✅</p>
      <p className="text-sm text-green-700 font-bold">Thanks! Your review has been submitted for moderation.</p>
    </div>
  )

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h4 className="font-extrabold text-gray-800 mb-4">Write a Review</h4>
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-semibold mb-2">Your Rating *</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(star => (
            <button type="button" key={star}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110">
              <span className={star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            </button>
          ))}
        </div>
      </div>
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors mb-3" />
      <textarea value={body} onChange={e => setBody(e.target.value)}
        placeholder="Share your experience with this product…" rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none mb-4" />
      <button type="button"
        onClick={() => { if (rating === 0) { toast.error('Please select a star rating'); return } submit.mutate() }}
        disabled={submit.isPending || rating === 0}
        className="px-6 py-3 rounded-xl text-white text-sm font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition-colors">
        {submit.isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}

function ProductTabs({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specs',  label: 'Specifications', hide: !product.specifications || Object.keys(product.specifications).length === 0 },
    { id: 'reviews', label: `Reviews (${product._count?.reviews || 0})` },
  ].filter(t => !t.hide)

  return (
    <div className="mt-10 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 px-6 flex gap-6 overflow-x-auto">
        {tabs.map(tab => (
          <button type="button" key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap -mb-px ${activeTab === tab.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">
        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
            {product.description
              ? <p>{product.description}</p>
              : <p className="text-gray-400 italic">No description provided for this product.</p>}
          </div>
        )}
        {activeTab === 'specs' && product.specifications && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([k, v]) => (
                  <tr key={k} className="border-b border-gray-50 even:bg-gray-50/50">
                    <td className="py-3 px-3 font-semibold text-gray-700 w-1/3">{k}</td>
                    <td className="py-3 px-3 text-gray-500">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div>
            {product.reviews?.length > 0 ? (
              <div className="space-y-5 mb-6">
                {product.reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-gray-50 pb-5 last:border-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-extrabold shrink-0">
                        {r.user?.firstName?.[0] || 'G'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous'}
                          {r.isVerifiedPurchase && (
                            <span className="ml-2 text-[11px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded">✓ Verified</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Stars rating={r.rating} size="sm" />
                          <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    {r.title && <p className="text-sm font-bold text-gray-700 mb-1">"{r.title}"</p>}
                    {r.body  && <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-3">⭐</div>
                <p className="font-bold text-gray-600 mb-1">No reviews yet</p>
                <p className="text-sm">Be the first to review this product</p>
              </div>
            )}
            <ReviewForm productId={product.id} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductDetailClient({ product, related = [] }: { product: any; related?: any[] }) {
  const { addItem }                 = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [selectedImg,      setSelectedImg]      = useState(0)
  const [qty,              setQty]              = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const price    = parseFloat(product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price)
  const compare  = product.comparePrice ? parseFloat(product.comparePrice) : null
  const discount = compare ? Math.round((1 - price / compare) * 100) : null
  const wished   = isWishlisted(product.id)
  const inStock  = product.stock > 0
  const rating   = parseFloat(product.vendor?.averageRating || 0)

  const variantGroups: Record<string, any[]> = {}
  product.variants?.forEach((v: any) => {
    if (!variantGroups[v.name]) variantGroups[v.name] = []
    variantGroups[v.name].push(v)
  })

  const addToCart = (buyNow = false) => {
    const variantInfo = Object.keys(selectedVariants).length > 0
      ? { name: Object.keys(selectedVariants)[0], value: Object.values(selectedVariants)[0] }
      : undefined
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price, image: product.images?.[0]?.url || '', slug: product.slug, variant: variantInfo })
    }
    if (buyNow) {
      window.location.href = '/checkout'
    } else {
      toast.success(`${qty}× ${product.name} added to cart`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
        <span>/</span>
        {product.category && (
          <><Link href={`/categories/${product.category.slug}`} className="hover:text-orange-500 transition-colors">{product.category.name}</Link><span>/</span></>
        )}
        <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-10 mb-8">

        {/* ── Image gallery ──────────────────────────────────────── */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 border border-gray-100 flex items-center justify-center">
            {product.images?.[selectedImg]?.url ? (
              <Image
                src={product.images[selectedImg].url}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <span className="text-8xl">📦</span>
            )}
            {discount && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
            {product.isFlashSale && (
              <span className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                ⚡ Flash Sale
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img: any, i: number) => (
                <button type="button" key={i}
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setSelectedImg(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${i === selectedImg ? 'border-orange-400 shadow-md' : 'border-transparent hover:border-gray-200'}`}>
                  <Image src={img.url} alt={`Product image ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-gray-400 font-semibold">Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${product.name} – ₦${price.toLocaleString()} on Ecove`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-colors">
              💬 WhatsApp
            </a>
            <button type="button"
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-600 hover:text-white transition-colors">
              🔗 Copy Link
            </button>
          </div>
        </div>

        {/* ── Product info ───────────────────────────────────────── */}
        <div>
          {product.brand && (
            <Link href={`/search?q=${encodeURIComponent(product.brand)}`}
              className="inline-block text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full mb-2 hover:bg-orange-100 transition-colors">
              {product.brand}
            </Link>
          )}
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3 leading-snug">{product.name}</h1>

          {/* Rating row */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Stars rating={rating} />
            <span className="text-sm text-gray-500">{rating.toFixed(1)} ({product._count?.reviews || 0} reviews)</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {inStock ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-extrabold text-orange-600">₦{price.toLocaleString()}</span>
              {compare && <span className="text-base text-gray-400 line-through">₦{compare.toLocaleString()}</span>}
              {discount && (
                <span className="bg-red-100 text-red-600 text-sm font-extrabold px-2.5 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {compare && (
              <p className="text-sm text-green-600 font-bold">
                You save ₦{(compare - price).toLocaleString()}
              </p>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 mb-5 leading-relaxed border-l-4 border-orange-200 pl-3">
              {product.shortDescription}
            </p>
          )}

          {/* Variants */}
          {Object.entries(variantGroups).map(([name, variants]) => (
            <div key={name} className="mb-4">
              <p className="text-sm font-extrabold text-gray-700 mb-2">{name}:</p>
              <div className="flex flex-wrap gap-2">
                {(variants as any[]).map((v: any) => (
                  <button type="button" key={v.id}
                    onClick={() => setSelectedVariants(prev => ({ ...prev, [name]: v.value }))}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${selectedVariants[name] === v.value ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-5">
            <p className="text-sm font-extrabold text-gray-700 mb-2">Quantity:</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-xl transition-colors"
                  aria-label="Decrease quantity">−</button>
                <span className="w-12 text-center text-sm font-extrabold" aria-live="polite">{qty}</span>
                <button type="button"
                  onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold text-xl transition-colors"
                  aria-label="Increase quantity">+</button>
              </div>
              <span className="text-xs text-gray-400">{product.stock} available</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 mb-5">
            <button type="button"
              onClick={() => addToCart(false)}
              disabled={!inStock}
              className="flex-1 py-3.5 rounded-xl border-2 border-orange-500 text-orange-600 font-extrabold text-sm hover:bg-orange-50 disabled:opacity-40 transition-colors">
              🛒 Add to Cart
            </button>
            <button type="button"
              onClick={() => addToCart(true)}
              disabled={!inStock}
              className="flex-1 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm disabled:opacity-40 transition-colors">
              Buy Now →
            </button>
            <button type="button"
              onClick={() => { toggleWishlist(product.id); toast.success(wished ? 'Removed from wishlist' : 'Saved to wishlist') }}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${wished ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-400'}`}>
              {wished ? '♥' : '♡'}
            </button>
          </div>

          {/* Vendor card */}
          {product.vendor && (
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                {product.vendor.businessName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Sold by</p>
                <Link href={`/store/${product.vendor.slug}`} className="text-sm font-bold text-gray-800 hover:text-orange-600 transition-colors">
                  {product.vendor.businessName}
                </Link>
                <p className="text-xs text-gray-400">
                  ⭐ {parseFloat(product.vendor.averageRating || 0).toFixed(1)} rating
                </p>
              </div>
              <Link href={`/store/${product.vendor.slug}`}
                className="shrink-0 text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap">
                Visit Store →
              </Link>
            </div>
          )}

          {/* Trust strip */}
          <div className="border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600">
              <span className="text-xl shrink-0">🚚</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Fast Delivery</p>
                <p className="text-xs text-gray-500">Dispatched within <strong>{product.handlingTime || '1–2 business days'}</strong> by {product.vendor?.businessName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600">
              <span className="text-xl shrink-0">🔄</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Easy Returns</p>
                <p className="text-xs text-gray-500">Return within 7 days of delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600">
              <span className="text-xl shrink-0">🔒</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Secure Checkout</p>
                <p className="text-xs text-gray-500">100% safe payment via Paystack · Flutterwave</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600">
              <span className="text-xl shrink-0">✅</span>
              <div>
                <p className="font-semibold text-gray-800 text-xs">Genuine Products</p>
                <p className="text-xs text-gray-500">All sellers verified by Ecove</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <ProductTabs product={product} />

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full inline-block" />
              Related Products
            </h2>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`}
                className="text-sm text-orange-500 font-semibold hover:underline">
                See all →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {related.slice(0, 5).map((p: any) => {
              const rPrice   = parseFloat(p.price)
              const rCompare = p.comparePrice ? parseFloat(p.comparePrice) : null
              const rDiscount = rCompare ? Math.round((1 - rPrice / rCompare) * 100) : null
              return (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <Link href={`/products/${p.slug}`}>
                    <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {p.images?.[0]?.url
                        ? <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="200px" />
                        : <span className="text-4xl">📦</span>}
                      {rDiscount && (
                        <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                          -{rDiscount}%
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link href={`/products/${p.slug}`}>
                      <p className="text-xs font-medium text-gray-800 line-clamp-2 mb-1.5 hover:text-orange-600 transition-colors">{p.name}</p>
                    </Link>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-orange-600 text-sm">₦{rPrice.toLocaleString()}</span>
                      {rCompare && <span className="text-xs text-gray-400 line-through">₦{rCompare.toLocaleString()}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
