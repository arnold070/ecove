'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'

const CATEGORIES = [
  ['🏠 Home',         '/'],
  ['All Categories',  '/search'],
  ['📱 Phones',       '/categories/phones-tablets'],
  ['💻 Computing',    '/categories/computing'],
  ['📺 Electronics',  '/categories/electronics'],
  ['👗 Fashion',      '/categories/fashion'],
  ['🛠️ Services',     '/categories/services'],
]

function Header() {
  const { items, totalItems, totalPrice, isOpen, toggleCart, removeItem, updateQuantity } = useCart()
  const { user, logout } = useAuth()
  const [query,       setQuery]       = useState('')
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[] } | null>(null)
  const [suggestOpen, setSuggestOpen] = useState(false)
  const suggestRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router   = useRouter()
  const pathname = usePathname()
  const cartRef  = useRef<HTMLDivElement>(null)

  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80)
  }, [searchOpen])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node) && isOpen) toggleCart()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, toggleCart])

  const closeSearch = () => { setSearchOpen(false); setQuery(''); setSuggestOpen(false) }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSuggestOpen(false)
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setMenuOpen(false)
      closeSearch()
    }
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    if (suggestRef.current) clearTimeout(suggestRef.current)
    if (val.length < 2) { setSuggestOpen(false); return }
    suggestRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/storefront/search?q=${encodeURIComponent(val)}&typeahead=true`)
        const data = await res.json()
        setSuggestions(data.data)
        setSuggestOpen(true)
      } catch { /* silent */ }
    }, 300)
  }

  return (
    <>
      {/* ── Top announcement bar ─────────────────────────────────────── */}
      <div className="bg-gray-900 text-white py-1.5 text-xs hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5"><span>📞</span> +234 800 ECOVE (32683)</span>
            <span className="text-white/40">|</span>
            <Link href="/vendor/register" className="hover:text-orange-400 transition-colors">Sell on Ecove</Link>
          </div>
          <div className="flex items-center gap-5 text-white/70">
            <span>🚚 Free delivery over ₦20,000</span>
            <span className="text-white/40">|</span>
            <Link href="/track" className="hover:text-white transition-colors">Track Order</Link>
          </div>
        </div>
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">

        {/* ──── MOBILE layout (< md): single row ──────────────────── */}
        <div className="md:hidden border-b border-gray-100">
          <div className="flex items-center px-3 py-2 gap-2">

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 shrink-0 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen ? 'true' : 'false'}
              aria-controls="mobile-nav"
            >
              <span className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 rounded transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>

            {/* Logo — centered between hamburger and cart */}
            <Link href="/" className="flex-1 flex justify-center" aria-label="Ecove — Go to homepage">
              <Image
                src="/images/ecove-logo.png"
                alt="Ecove.com.ng"
                width={180}
                height={72}
                className="h-14 w-auto object-contain"
                priority
              />
            </Link>

            {/* Search icon — opens full-screen overlay */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-orange-500 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
            </button>

            {/* Cart → navigates to /cart on mobile */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-10 h-10 text-gray-700 hover:text-orange-500 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              aria-label={`Cart${totalItems() > 0 ? ` (${totalItems()} items)` : ''}`}
            >
              <span className="text-xl leading-none">🛒</span>
              {totalItems() > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-orange-500 text-white text-[9px] font-extrabold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                  {totalItems()}
                </span>
              )}
            </Link>

          </div>
        </div>

        {/* ──── DESKTOP layout (md+): 3-col grid ──────────────────── */}
        <div className="hidden md:block border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">

            {/* Left: logo */}
            <Link href="/" className="shrink-0" aria-label="Ecove — Go to homepage">
              <Image
                src="/images/ecove-logo.png"
                alt="Ecove.com.ng"
                width={280}
                height={112}
                className="h-16 lg:h-24 w-auto object-contain"
                priority
              />
            </Link>

            {/* Centre: search bar */}
            <div className="flex justify-center">
              <div className="w-full max-w-xl relative">
                <form onSubmit={handleSearch} role="search" className="flex rounded-lg overflow-hidden border-2 border-orange-400 focus-within:border-orange-500 transition-colors">
                  <label htmlFor="site-search" className="sr-only">Search products, brands, categories</label>
                  <input
                    id="site-search"
                    type="text"
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    onBlur={() => setTimeout(() => setSuggestOpen(false), 200)}
                    onFocus={() => query.length >= 2 && setSuggestOpen(true)}
                    placeholder="Search products, brands, categories…"
                    autoComplete="off"
                    aria-label="Search products, brands, categories"
                    className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-white"
                  />
                  <button type="submit" className="px-5 text-white text-sm font-bold bg-orange-500 hover:bg-orange-600 transition-colors" aria-label="Search">
                    🔍
                  </button>
                </form>

                {/* Desktop autocomplete dropdown */}
                {suggestOpen && suggestions && (suggestions.products?.length > 0 || suggestions.categories?.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-96 overflow-y-auto">
                    {suggestions.categories?.length > 0 && (
                      <div className="px-3 pt-3 pb-1">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide px-2 mb-1.5">Categories</p>
                        {suggestions.categories.map((cat: any) => (
                          <button type="button" key={cat.id} onMouseDown={() => { router.push(`/categories/${cat.slug}`); setSuggestOpen(false); setQuery('') }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-orange-50 text-left transition-colors">
                            <span className="text-base">🗂️</span>
                            <span className="font-medium text-gray-700">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {suggestions.products?.length > 0 && (
                      <div className="px-3 pb-3">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wide px-2 mt-2 mb-1.5">Products</p>
                        {suggestions.products.map((p: any) => (
                          <button type="button" key={p.id} onMouseDown={() => { router.push(`/products/${p.slug}`); setSuggestOpen(false); setQuery('') }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-orange-50 text-left transition-colors">
                            <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                              {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <span>📦</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-orange-500 font-bold text-xs">₦{parseFloat(p.price).toLocaleString()}</p>
                            </div>
                          </button>
                        ))}
                        <button type="button" onMouseDown={() => { router.push(`/search?q=${encodeURIComponent(query)}`); setSuggestOpen(false) }}
                          className="w-full mt-1 py-2 text-xs font-semibold text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                          See all results for &ldquo;{query}&rdquo; →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right nav icons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Sell on Ecove */}
              <Link href="/vendor/register"
                className="hidden lg:flex flex-col items-center px-3 py-1 text-gray-600 hover:text-orange-500 rounded-lg transition-colors text-center">
                <span className="text-lg">🏪</span>
                <span className="text-[10px] font-semibold whitespace-nowrap">Sell</span>
              </Link>

              {/* Account dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  className="flex flex-col items-center px-3 py-1 text-gray-600 hover:text-orange-500 rounded-lg transition-colors"
                  aria-label={user ? `My account — ${user.firstName}` : 'Account'}
                  aria-haspopup="true"
                >
                  <span className="text-lg">👤</span>
                  <span className="text-[10px] font-semibold">{user ? user.firstName : 'Account'}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b mb-1">
                        <p className="text-sm font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link href="/account"  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">👤 My Account</Link>
                      <Link href="/orders"   className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">📦 My Orders</Link>
                      {(user.role === 'admin' || user.role === 'super_admin') && (
                        <Link href="/admin"  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50 font-semibold text-orange-600">⚙️ Admin Panel</Link>
                      )}
                      {user.role === 'vendor' && (
                        <Link href="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50 font-semibold text-orange-600">🏪 Vendor Dashboard</Link>
                      )}
                      <hr className="my-1" />
                      <button type="button" onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">🚪 Sign Out</button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 flex gap-2">
                        <Link href="/login"    className="flex-1 py-2 text-center text-sm font-bold rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition-colors">Sign In</Link>
                        <Link href="/register" className="flex-1 py-2 text-center text-sm font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Register</Link>
                      </div>
                      <hr className="my-1" />
                      <Link href="/orders"          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">📦 My Orders</Link>
                      <Link href="/vendor/register" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-orange-50 text-orange-600 font-semibold">🏪 Sell on Ecove</Link>
                    </>
                  )}
                </div>
              </div>

              {/* Wishlist */}
              <Link href="/account?tab=wishlist"
                className="flex flex-col items-center px-3 py-1 text-gray-600 hover:text-orange-500 rounded-lg transition-colors"
                aria-label="Wishlist">
                <span className="text-lg">♡</span>
                <span className="text-[10px] font-semibold">Wishlist</span>
              </Link>

              {/* Cart with dropdown drawer */}
              <div ref={cartRef} className="relative">
                <button
                  type="button"
                  onClick={toggleCart}
                  aria-label={`Cart${totalItems() > 0 ? ` (${totalItems()})` : ''}`}
                  aria-expanded={isOpen ? 'true' : 'false'}
                  aria-controls="cart-drawer"
                  className="flex flex-col items-center px-3 py-1 text-gray-600 hover:text-orange-500 rounded-lg transition-colors relative"
                >
                  <span className="text-lg relative">
                    🛒
                    {totalItems() > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-extrabold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {totalItems()}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-semibold">Cart</span>
                </button>

                {/* Cart Drawer */}
                {isOpen && (
                  <div id="cart-drawer" className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                    role="dialog" aria-label="Shopping cart" aria-modal="false">
                    <div className="px-4 py-3 border-b flex justify-between items-center bg-gray-50">
                      <span className="font-bold text-sm text-gray-800">My Cart ({totalItems()})</span>
                      <button type="button" onClick={toggleCart} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Close cart">✕</button>
                    </div>
                    {items.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-sm">
                        <div className="text-5xl mb-3">🛒</div>
                        <p className="font-medium">Your cart is empty</p>
                        <Link href="/search" onClick={toggleCart} className="mt-3 inline-block text-orange-500 font-semibold text-xs hover:underline">Start shopping →</Link>
                      </div>
                    ) : (
                      <>
                        <ul className="max-h-64 overflow-y-auto divide-y list-none m-0 p-0">
                          {items.map(item => (
                            <li key={item.id} className="flex gap-3 p-3">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0 overflow-hidden">
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span>📦</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-orange-500 font-bold mt-0.5">₦{item.price.toLocaleString()}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 border border-gray-200 rounded text-xs flex items-center justify-center hover:bg-gray-100 text-gray-600" aria-label="Decrease">−</button>
                                  <span className="text-xs font-bold text-gray-700 w-4 text-center">{item.quantity}</span>
                                  <button type="button" onClick={() => updateQuantity(item.id, Math.min(99, item.quantity + 1))} className="w-5 h-5 border border-gray-200 rounded text-xs flex items-center justify-center hover:bg-gray-100 text-gray-600" aria-label="Increase">+</button>
                                </div>
                              </div>
                              <button type="button" onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 text-sm self-start shrink-0 mt-0.5" aria-label={`Remove ${item.name}`}>✕</button>
                            </li>
                          ))}
                        </ul>
                        <div className="p-4 border-t bg-gray-50">
                          <div className="flex justify-between text-sm font-bold mb-3 text-gray-800">
                            <span>Subtotal</span>
                            <span className="text-orange-500">₦{totalPrice().toLocaleString()}</span>
                          </div>
                          <Link href="/checkout" onClick={toggleCart}
                            className="block w-full py-3 rounded-lg text-white text-sm font-bold text-center bg-orange-500 hover:bg-orange-600 transition-colors">
                            Checkout →
                          </Link>
                          <Link href="/cart" onClick={toggleCart} className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-2">
                            View full cart
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Category nav bar ─── */}
          <nav aria-label="Product categories" className="bg-orange-500">
            <div className="max-w-7xl mx-auto px-4 flex items-center text-white text-sm">
              {CATEGORIES.map(([label, href]) => (
                <Link key={href} href={href} className="px-4 py-2.5 whitespace-nowrap hover:bg-white/15 transition-colors font-medium">
                  {label}
                </Link>
              ))}
              <Link href="/search?flashSale=true" className="px-4 py-2.5 whitespace-nowrap hover:bg-white/15 transition-colors font-extrabold text-yellow-300 flex items-center gap-1">
                ⚡ Flash Sales
              </Link>
              <div className="ml-auto flex items-center gap-1 pr-1">
                <Link href="/about"           className="px-4 py-2.5 whitespace-nowrap hover:bg-white/15 transition-colors font-medium">About</Link>
                <Link href="/contact"         className="px-4 py-2.5 whitespace-nowrap hover:bg-white/15 transition-colors font-medium">Contact</Link>
                <Link href="/vendor/register" className="px-4 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 rounded-lg transition-colors whitespace-nowrap">🏪 Sell on Ecove</Link>
              </div>
            </div>
          </nav>
        </div>

      </header>

      {/* ── Mobile full-screen search overlay ───────────────────────── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-[200] bg-white flex flex-col animate-fade-in">

          {/* Input row */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 shrink-0">
            <form onSubmit={handleSearch} role="search"
              className="flex-1 flex rounded-xl overflow-hidden border-2 border-orange-400 focus-within:border-orange-500 transition-colors">
              <label htmlFor="mobile-search-overlay" className="sr-only">Search products</label>
              <input
                ref={searchInputRef}
                id="mobile-search-overlay"
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                onFocus={() => query.length >= 2 && setSuggestOpen(true)}
                placeholder="Search products, brands, categories…"
                autoComplete="off"
                className="flex-1 px-4 py-2.5 text-sm text-gray-800 outline-none bg-white"
              />
              <button type="submit" className="px-4 bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors" aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
                </svg>
              </button>
            </form>
            <button type="button" onClick={closeSearch}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 text-lg shrink-0 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close search">
              ✕
            </button>
          </div>

          {/* Results / empty state */}
          <div className="flex-1 overflow-y-auto">
            {suggestOpen && suggestions && (suggestions.products?.length > 0 || suggestions.categories?.length > 0) ? (
              <div className="pb-6">
                {suggestions.categories?.length > 0 && (
                  <div className="px-4 pt-4 pb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Categories</p>
                    {suggestions.categories.map((cat: any) => (
                      <button type="button" key={cat.id}
                        onMouseDown={() => { router.push(`/categories/${cat.slug}`); closeSearch() }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl hover:bg-orange-50 text-left transition-colors">
                        <span className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-base shrink-0">🗂️</span>
                        <span className="font-medium text-gray-700">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.products?.length > 0 && (
                  <div className="px-4 pt-2 pb-2">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">Products</p>
                    {suggestions.products.map((p: any) => (
                      <button type="button" key={p.id}
                        onMouseDown={() => { router.push(`/products/${p.slug}`); closeSearch() }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-orange-50 text-left transition-colors">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xl">📦</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                          <p className="text-orange-500 font-bold text-sm mt-0.5">₦{parseFloat(p.price).toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                    <button type="button"
                      onMouseDown={() => { router.push(`/search?q=${encodeURIComponent(query)}`); closeSearch() }}
                      className="w-full mt-2 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors border border-orange-200">
                      See all results for &ldquo;{query}&rdquo; →
                    </button>
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <span className="text-5xl">🔍</span>
                <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            ) : (
              <div className="px-4 pt-6">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Quick browse</p>
                <div className="flex flex-wrap gap-2">
                  {['Phones', 'Laptops', 'Fashion', 'Electronics', 'Services', 'Home & Kitchen'].map(term => (
                    <button key={term} type="button"
                      onClick={() => { setQuery(term); handleQueryChange(term) }}
                      className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-colors">
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ── Mobile slide-in drawer ────────────────────────────────────── */}
      <div id="mobile-nav" className={`md:hidden fixed inset-0 z-40 transition-all duration-200 ${menuOpen ? 'visible' : 'invisible'}`}
        role="dialog" aria-label="Mobile navigation menu" aria-modal="true">
        <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOpen(false)} aria-hidden="true" />

        <div className={`absolute top-0 left-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-200 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer header */}
          <div className="px-4 py-3 flex items-center justify-between shrink-0 bg-white border-b border-gray-100">
            <Link href="/" onClick={() => setMenuOpen(false)} aria-label="Ecove homepage">
              <Image src="/images/ecove-logo.png" alt="Ecove.com.ng" width={130} height={52} className="h-12 w-auto object-contain" />
            </Link>
            <button type="button" onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl leading-none" aria-label="Close menu">✕</button>
          </div>

          {/* Auth strip */}
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.firstName} {user.lastName}</p>
                  <Link href="/account" className="text-xs text-orange-500 hover:underline" onClick={() => setMenuOpen(false)}>My Account</Link>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login"    onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors">Sign In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-bold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">Register</Link>
              </div>
            )}
          </div>

          {/* Sell on Ecove */}
          <div className="px-4 py-3 border-b border-orange-100 bg-orange-50 shrink-0">
            <Link href="/vendor/register" onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-white rounded-xl bg-orange-500 hover:bg-orange-600 transition-colors">
              🏪 Sell on Ecove
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <form onSubmit={handleSearch} role="search" className="flex rounded-lg overflow-hidden border border-gray-200 focus-within:border-orange-400 transition-colors">
              <label htmlFor="mobile-search" className="sr-only">Search products</label>
              <input id="mobile-search" type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search products…" className="flex-1 px-3 py-2.5 text-sm bg-white outline-none text-gray-800" />
              <button type="submit" className="px-3 bg-orange-500 text-white" aria-label="Search">🔍</button>
            </form>
          </div>

          {/* Category links */}
          <nav className="flex-1 overflow-y-auto">
            <p className="px-4 pt-3 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Categories</p>
            {CATEGORIES.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50 transition-colors">
                {label}
              </Link>
            ))}
            <Link href="/search?flashSale=true" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-extrabold text-yellow-600 hover:bg-yellow-50 border-b border-gray-50">
              ⚡ Flash Sales
            </Link>
            <p className="px-4 pt-4 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Info</p>
            <Link href="/about" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50">
              ℹ️ About Ecove
            </Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50">
              📬 Contact Us
            </Link>
            {user && (
              <>
                <p className="px-4 pt-4 pb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">My Account</p>
                <Link href="/orders"  onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50">📦 My Orders</Link>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50">👤 Profile</Link>
                {user.role === 'vendor' && (
                  <Link href="/vendor/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 border-b border-gray-50">🏪 Vendor Dashboard</Link>
                )}
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 border-b border-gray-50">⚙️ Admin Panel</Link>
                )}
              </>
            )}
          </nav>

          {/* Bottom */}
          {user && (
            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <button type="button" onClick={() => { logout(); setMenuOpen(false) }}
                className="block w-full py-2.5 text-center text-sm text-red-400 hover:text-red-600 font-medium">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Persistent mobile bottom navigation bar ──────────────────────────────────
// Design: dark navy bg, 5 tabs, active tab gets orange pill behind its icon
function BottomNav() {
  const { user }   = useAuth()
  const pathname   = usePathname()
  const [search, setSearch] = useState('')
  useEffect(() => { setSearch(typeof window !== 'undefined' ? window.location.search : '') }, [pathname])

  const tabs = [
    {
      href:  '/',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 12L12 4l9 8" /><path d="M9 21V12h6v9" /><path d="M3 12v9h18V12" />
        </svg>
      ),
    },
    {
      href:  '/search',
      label: 'Categories',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3"  y="3"  width="7" height="7" rx="1" />
          <rect x="14" y="3"  width="7" height="7" rx="1" />
          <rect x="3"  y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      href:  '/categories/services',
      label: 'Services',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      ),
    },
    {
      href:  '/account?tab=wishlist',
      label: 'Wishlist',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      href:  user ? '/account' : '/login',
      label: user ? user.firstName : 'Account',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      className="block fixed bottom-0 left-0 right-0 z-[100] bg-[#0f1929] border-t border-white/10 pb-safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16">
        {tabs.map(({ href, label, icon }) => {
          const base      = href.split('?')[0]
          const tabQuery  = href.includes('?') ? href.split('?')[1] : ''
          const sibling   = tabs.find(t => t.href !== href && t.href.split('?')[0] === base && t.href.includes('?'))
          const active    = base === '/'
            ? pathname === '/'
            : tabQuery
              ? pathname === base && search.includes(tabQuery)
              : pathname.startsWith(base) && !(sibling && search.includes(sibling.href.split('?')[1]))
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors">
              {/* Icon — orange pill when active */}
              <span className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${active ? 'bg-orange-500 text-white' : 'text-white/45'}`}>
                {icon}
              </span>
              {/* Label */}
              <span className={`text-[9px] font-semibold leading-none truncate max-w-[52px] ${active ? 'text-orange-400' : 'text-white/40'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16 pb-16">

      {/* ── App download + social strip ───────────────────────────── */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-extrabold text-base mb-1">Download the Ecove App</p>
            <p className="text-sm text-gray-400">Shop faster. Get exclusive app-only deals.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed opacity-70">
              <span className="text-xl">🍎</span>
              <div className="text-left leading-tight">
                <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide">Coming Soon</p>
                <p className="font-bold">App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed opacity-70">
              <span className="text-xl">▶</span>
              <div className="text-left leading-tight">
                <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide">Coming Soon</p>
                <p className="font-bold">Google Play</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: 'Facebook',   icon: 'f',  href: 'https://facebook.com/ecoveng' },
              { label: 'X/Twitter',  icon: '𝕏',  href: 'https://x.com/ecoveng' },
              { label: 'Instagram',  icon: '◎',  href: 'https://instagram.com/ecoveng' },
              { label: 'WhatsApp',   icon: '✆',  href: 'https://wa.me/2348000000000' },
            ].map(({ label, icon, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 transition-colors text-sm font-bold flex items-center justify-center">
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main footer columns ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-5 gap-8">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="bg-white inline-block rounded-xl px-3 py-2 mb-4">
            <Image src="/images/ecove-logo.png" alt="Ecove.com.ng" width={130} height={52} className="h-12 w-auto object-contain" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Nigeria's fastest-growing multi-vendor marketplace. Shop from verified sellers nationwide.
          </p>
          <p className="text-gray-500 text-xs mt-3">📞 +234 800 ECOVE (32683)</p>
          <p className="text-gray-500 text-xs mt-1">✉️ hello@ecove.com.ng</p>
        </div>

        {/* Link columns */}
        {[
          { title: 'Shop',
            links: [['All Products','/search'],['Flash Sales','/search?flashSale=true'],['New Arrivals','/search?sort=newest'],['Best Sellers','/search?bestSeller=true'],['Phones & Tablets','/categories/phones-tablets']] },
          { title: 'Sell',
            links: [['Start Selling','/vendor/register'],['Vendor Login','/vendor/login'],['Vendor Policies','/vendor-policies'],['Commission Rates','/vendor-policies#commission'],['Seller Support','mailto:sellers@ecove.com.ng']] },
          { title: 'Help',
            links: [['Contact Us','mailto:hello@ecove.com.ng'],['Track Order','/track'],['Returns Policy','/returns'],['Privacy Policy','/privacy'],['Terms of Use','/terms']] },
          { title: 'Company',
            links: [['About Ecove','/about'],['Careers','/careers'],['Press','/press'],['Blog','/blog'],['Partner With Us','/partners']] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="font-extrabold text-sm mb-4 text-white">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 text-sm hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Payment methods ───────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Secure Payment Methods</p>
            <div className="flex items-center gap-2 flex-wrap">
              {['Visa', 'Mastercard', 'Verve', 'Paystack', 'Flutterwave', 'Bank Transfer'].map(pm => (
                <span key={pm} className="bg-white/10 text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/10">
                  {pm}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Our Logistics Partners</p>
            <div className="flex items-center gap-2">
              {['DHL', 'GIG Logistics', 'RedStar'].map(l => (
                <span key={l} className="bg-white/10 text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-white/10">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright ─────────────────────────────────────────────── */}
      <div className="border-t border-white/10 py-4 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} Ecove Marketplace Ltd · ecove.com.ng · All rights reserved
      </div>
    </footer>
  )
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-orange-600 focus:font-bold focus:rounded-lg focus:shadow-lg">
        Skip to main content
      </a>
      <div className="flex flex-col min-h-screen">
        <Header />
        {/* pb-nav-safe keeps content clear of the bottom nav + device gesture bar */}
        <main id="main-content" className="flex-1 pb-nav-safe">{children}</main>
        <Footer />
      </div>
      {/* BottomNav is outside the flex wrapper so fixed positioning works on all browsers */}
      <BottomNav />
    </>
  )
}
