'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

const CATEGORY_ICONS: Record<string, string> = {
  'phones-tablets': '📱', 'computing': '💻', 'electronics': '📺',
  'fashion': '👗', 'home-kitchen': '🏠', 'beauty-health': '💄',
  'baby-products': '👶', 'sports-outdoors': '⚽', 'groceries': '🛒',
  'automotive': '🚗', 'gaming': '🎮', 'books-education': '📚', 'services': '🛠️',
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </span>
  )
}

function ProductCard({ p, addItem }: { p: any; addItem: (item: any) => void }) {
  const price    = parseFloat(p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price)
  const compare  = p.comparePrice ? parseFloat(p.comparePrice) : null
  const discount = compare ? Math.round((1 - price / compare) * 100) : null
  const rating   = parseFloat(p.vendor?.averageRating || 0)

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
      <Link href={`/products/${p.slug}`} className="relative block">
        <div className="h-36 sm:h-48 bg-gray-50 relative flex items-center justify-center overflow-hidden">
          {p.images?.[0]?.url
            ? <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="220px" />
            : <span className="text-5xl">{CATEGORY_ICONS[p.category?.slug] || '📦'}</span>}
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {p.isBestSeller && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
              BEST SELLER
            </span>
          )}
          {p.isFlashSale && (
            <span className="absolute bottom-2 left-2 bg-yellow-400 text-gray-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              ⚡ Flash Sale
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${p.slug}`}>
          <p className="text-sm text-gray-800 line-clamp-2 mb-1.5 hover:text-orange-600 transition-colors leading-snug font-medium">{p.name}</p>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Stars rating={rating} />
          <span className="text-[11px] text-gray-400">({p._count?.reviews || 0})</span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-extrabold text-orange-600 text-base">₦{price.toLocaleString()}</span>
          {compare && <span className="text-xs text-gray-400 line-through">₦{compare.toLocaleString()}</span>}
        </div>
        {p.vendor?.businessName && (
          <p className="text-[11px] text-gray-400 mb-2 truncate">by {p.vendor.businessName}</p>
        )}
        <div className="mt-auto">
          {p.stock > 0
            ? (
              <button
                type="button"
                onClick={() => { addItem({ id: p.id, name: p.name, price, image: p.images?.[0]?.url || '', slug: p.slug }); toast.success('Added to cart') }}
                className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
              >
                Add to Cart
              </button>
            )
            : (
              <p className="text-center text-xs text-red-500 font-semibold py-2 bg-red-50 rounded-lg">Out of Stock</p>
            )
          }
        </div>
      </div>
    </div>
  )
}

function FilterSidebar({
  categories, category, flashSale, featured, bestSeller,
  localMin, localMax, updateParam, updatePrice, onClose,
}: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
      {/* Categories */}
      <div className="p-4">
        <h3 className="font-extrabold text-sm text-gray-800 mb-3">Category</h3>
        <div className="space-y-0.5">
          <button type="button"
            onClick={() => { updateParam('category', ''); onClose?.() }}
            className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-orange-500 text-white font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
            All Products
          </button>
          {categories.map((cat: any) => (
            <button type="button" key={cat.id}
              onClick={() => { updateParam('category', cat.slug); onClose?.() }}
              className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat.slug ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
              <span>{CATEGORY_ICONS[cat.slug] || '📦'}</span>
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="p-4">
        <h3 className="font-extrabold text-sm text-gray-800 mb-3">Price Range (₦)</h3>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" value={localMin} onChange={e => updatePrice('minPrice', e.target.value)}
            className="w-full p-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-400 transition-colors" />
          <span className="text-gray-300 shrink-0">—</span>
          <input type="number" placeholder="Max" value={localMax} onChange={e => updatePrice('maxPrice', e.target.value)}
            className="w-full p-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-orange-400 transition-colors" />
        </div>
      </div>

      {/* Quick filters */}
      <div className="p-4">
        <h3 className="font-extrabold text-sm text-gray-800 mb-3">Filter By</h3>
        <div className="space-y-1.5">
          {([
            ['⚡ Flash Sale', 'flashSale', flashSale],
            ['⭐ Featured',   'featured',  featured],
            ['🏆 Best Sellers','bestSeller', bestSeller],
          ] as [string, string, boolean][]).map(([label, key, active]) => (
            <button type="button" key={key}
              onClick={() => updateParam(key, active ? '' : 'true')}
              className={`flex items-center gap-2.5 w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${active ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-gray-50 text-gray-600'}`}>
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] shrink-0 transition-colors ${active ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'}`}>
                {active && '✓'}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SearchContent() {
  const sp     = useSearchParams()
  const router = useRouter()
  const { addItem } = useCart()

  const [products,    setProducts]    = useState<any[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [page,        setPage]        = useState(1)
  const [categories,  setCategories]  = useState<any[]>([])
  const [filterOpen,  setFilterOpen]  = useState(false)

  const q          = sp.get('q')          || ''
  const category   = sp.get('category')   || ''
  const sort       = sp.get('sort')       || 'newest'
  const flashSale  = sp.get('flashSale')  === 'true'
  const featured   = sp.get('featured')   === 'true'
  const bestSeller = sp.get('bestSeller') === 'true'
  const minPrice   = sp.get('minPrice')   || ''
  const maxPrice   = sp.get('maxPrice')   || ''

  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const limit = 24

  useEffect(() => {
    const params = new URLSearchParams()
    if (q)          params.set('q', q)
    if (category)   params.set('category', category)
    if (sort && sort !== 'newest') params.set('sort', sort)
    if (flashSale)  params.set('flashSale', 'true')
    if (featured)   params.set('featured', 'true')
    if (bestSeller) params.set('bestSeller', 'true')
    if (minPrice)   params.set('minPrice', minPrice)
    if (maxPrice)   params.set('maxPrice', maxPrice)
    params.set('page',  String(page))
    params.set('limit', String(limit))
    setLoading(true)
    fetch(`/api/storefront/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.data || []); setTotal(d.pagination?.total || 0) })
      .finally(() => setLoading(false))
  }, [q, category, sort, flashSale, featured, bestSeller, minPrice, maxPrice, page])

  useEffect(() => { setLocalMin(minPrice); setLocalMax(maxPrice) }, [minPrice, maxPrice])

  useEffect(() => {
    fetch('/api/storefront/categories?limit=20')
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
  }, [])

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString())
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    router.push(`/search?${p}`)
    setPage(1)
  }

  const updatePrice = (key: 'minPrice' | 'maxPrice', val: string) => {
    if (key === 'minPrice') setLocalMin(val); else setLocalMax(val)
    if (priceTimer.current) clearTimeout(priceTimer.current)
    priceTimer.current = setTimeout(() => updateParam(key, val), 600)
  }

  const totalPages = Math.ceil(total / limit)

  const activeFilters = [
    flashSale && { label: '⚡ Flash Sale', clear: () => updateParam('flashSale', '') },
    featured  && { label: '⭐ Featured',  clear: () => updateParam('featured',  '') },
    bestSeller&& { label: '🏆 Best Sellers',clear: () => updateParam('bestSeller','') },
    minPrice  && { label: `₦${parseInt(minPrice).toLocaleString()}+`, clear: () => updateParam('minPrice', '') },
    maxPrice  && { label: `Up to ₦${parseInt(maxPrice).toLocaleString()}`, clear: () => updateParam('maxPrice', '') },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const heading = q          ? `Results for "${q}"`
    : flashSale              ? '⚡ Flash Sales'
    : featured               ? '⭐ Featured Products'
    : bestSeller             ? '🏆 Best Sellers'
    : category               ? (categories.find(c => c.slug === category)?.name || 'Products')
    : 'All Products'

  const sidebarProps = { categories, category, flashSale, featured, bestSeller, localMin, localMax, updateParam, updatePrice }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span>/</span>
        {category ? (
          <><span className="hover:text-orange-500 cursor-pointer" onClick={() => updateParam('category', '')}>{heading}</span></>
        ) : (
          <span className="text-gray-600">{q ? 'Search' : 'All Products'}</span>
        )}
      </nav>

      <div className="flex gap-6">

        {/* ── Desktop filter sidebar ─────────────────────────────────── */}
        <aside className="hidden lg:block w-56 shrink-0 self-start sticky top-24">
          <FilterSidebar {...sidebarProps} />
        </aside>

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">{heading}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString()} product{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button type="button"
                onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-orange-400 transition-colors">
                <span>⚙️</span> Filter
                {activeFilters.length > 0 && <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilters.length}</span>}
              </button>
              <select aria-label="Sort products" value={sort} onChange={e => updateParam('sort', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors bg-white">
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map(f => (
                <button type="button" key={f.label} onClick={f.clear}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 hover:bg-orange-100 transition-colors">
                  {f.label} <span className="text-orange-400">✕</span>
                </button>
              ))}
              <button type="button"
                onClick={() => router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')}
                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-extrabold text-gray-700 mb-2">No products found</p>
              <p className="text-sm mb-6">Try adjusting your search or removing filters</p>
              <Link href="/search" className="inline-block px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors">
                Browse All Products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} p={p} addItem={addItem} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  <button type="button"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-orange-400 transition-colors">
                    ← Prev
                  </button>
                  {[...Array(Math.min(7, totalPages))].map((_, i) => {
                    const pg = i + Math.max(1, page - 3)
                    if (pg > totalPages) return null
                    return (
                      <button type="button" key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${pg === page ? 'bg-orange-500 text-white' : 'border border-gray-200 hover:border-orange-400 text-gray-700'}`}>
                        {pg}
                      </button>
                    )
                  })}
                  <button type="button"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:border-orange-400 transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────── */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
              <p className="font-extrabold text-gray-800">Filters</p>
              <button type="button" onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar {...sidebarProps} onClose={() => setFilterOpen(false)} />
            </div>
            <div className="p-4 border-t shrink-0">
              <button type="button" onClick={() => setFilterOpen(false)}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors">
                See {total.toLocaleString()} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-3">🔍</div>
          <p className="text-gray-400 text-sm">Loading products…</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
